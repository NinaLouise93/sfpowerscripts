import child_process = require("child_process");
import tl = require("azure-pipelines-task-lib/task");
import { delay } from "../Common/Delay";
import rimraf = require("rimraf");
import { copyFile, copyFileSync, readdirSync, fstat, existsSync } from "fs";
import { isNullOrUndefined } from "util";
import { onExit } from "../Common/OnExit";
let path = require("path");

export default class DeploySourceToOrgImpl {
  public constructor(
    private target_org: string,
    private project_directory: string,
    private source_directory: string,
    private deployment_options: any,
    private isToBreakBuildIfEmpty: boolean
  ) {}

  public async exec() {
    let commandExecStatus: boolean = false;

    //Clean mdapi directory
    rimraf.sync("mdapi");

    let directoryToCheck = path.join(
      this.project_directory,
      this.source_directory
    );

    try {
      //Check Folder Exists and if Build should not be broken , then just skip
      if (!existsSync(directoryToCheck) && !this.isToBreakBuildIfEmpty) {
        console.log(
          ` Folder not Found , skipping task as isToBreakBuildIfEmpty is ${this.isToBreakBuildIfEmpty}`
        );
        return;
      }

      //Check there is any files inside thie directory and if Build should not be broken , then just skip
      if (this.isEmptyFolder(directoryToCheck) && !this.isToBreakBuildIfEmpty) {
        console.log(
          `Empty Folder Found , skipping task as isToBreakBuildIfEmpty is ${this.isToBreakBuildIfEmpty}`
        );
        return;
      }
    } catch (err) {
      console.log(`Something wrong with the path provided ${directoryToCheck}`);
      if (!this.isToBreakBuildIfEmpty) return;
      else throw err;
    }

    tl.debug("Converting source to mdapi");
    await this.convertSourceToMDAPI();

    try {
      if (this.deployment_options["checkonly"])
        copyFileSync(
          this.deployment_options["validation_ignore"],
          this.project_directory
        );
    } catch (err) {
      //Do something here
      console.log("Validation Ignore not found, using .forceignore");
    }

    let command = await this.buildExecCommand();
    let result = child_process.execSync(command, {
      cwd: this.project_directory,
      encoding: "utf8"
    });
    tl.debug(result);
    let resultAsJSON = JSON.parse(result);
    let deploy_id = resultAsJSON.result.id;

    tl.setVariable("sfpowerkit_deploysource_id", deploy_id);

    if (this.deployment_options["checkonly"])
      console.log(
        `Validation is in progress....  Unleashing the power of your code!`
      );
    else
      console.log(
        `Deployment is in progress....  Unleashing the power of your code!`
      );

    while (true) {
      try {
        result = child_process.execSync(
          `npx sfdx force:mdapi:deploy:report --json -i ${deploy_id} -u ${this.target_org}`,
          {
            cwd: this.project_directory,
            encoding: "utf8",
            stdio: ["pipe", "pipe", "ignore"]
          }
        );
      } catch (err) {
        console.log(`Validation/Deployment Failed`);
        break;
      }
      let resultAsJSON = JSON.parse(result);

      if (resultAsJSON["status"] == 1) {
        console.log("Validation/Deployment Failed");
        commandExecStatus = false;
        break;
      } else if (
        resultAsJSON["result"]["status"] == "InProgress" ||
        resultAsJSON["result"]["status"] == "Pending"
      ) {
        console.log(
          `Processing ${resultAsJSON.result.numberComponentsDeployed} out of ${resultAsJSON.result.numberComponentsTotal}`
        );
      } else if (resultAsJSON["result"]["status"] == "Succeeded") {
        console.log("Validation/Deployment Succeeded");
        commandExecStatus = true;
        break;
      }

      await delay(30000);
    }

    let child = child_process.exec(
      `npx sfdx force:mdapi:deploy:report  -i ${deploy_id} -u ${this.target_org}`,
      { cwd: this.project_directory, encoding: "utf8" },
      (error, stdout, stderr) => {}
    );

    child.stdout.on("data", data => {
      console.log(data.toString());
    });
    child.stderr.on("data", data => {
      console.log(data.toString());
    });

    await onExit(child);
  }

  private async buildExecCommand(): Promise<string> {
    let apexclasses;

    let command = `npx sfdx force:mdapi:deploy -u ${this.target_org}`;

    if (this.deployment_options["checkonly"]) command += ` -c`;

    //directory
    command += ` -d mdapi`;

    //testlevel
    command += ` -l ${this.deployment_options["testlevel"]}`;

    //add json
    command += ` --json`;

    if (this.deployment_options["testlevel"] == "RunApexTestSuite") {
      apexclasses = await this.convertApexTestSuiteToListOfApexClasses(
        this.deployment_options["apextestsuite"]
      );
      command += ` -r ${apexclasses}`;
    } else if (this.deployment_options["testlevel"] == "RunSpecifiedTests") {
      apexclasses = this.deployment_options["specified_tests"];
      command += ` -r ${apexclasses}`;
    }

    tl.debug("Generated Command");
    tl.debug(command);

    return command;
  }

  private async convertApexTestSuiteToListOfApexClasses(
    apextestsuite: string
  ): Promise<string> {
    console.log(
      "Converts an apex test suite to its consituent apex classes as a single line separated by commas"
    );
    let result = child_process.execSync(
      `npx sfdx sfpowerkit:source:apextestsuite:convert  -n ${apextestsuite}`,
      { cwd: this.project_directory, encoding: "utf8" }
    );
    return result;
  }

  private async convertSourceToMDAPI(): Promise<void> {
    try {
      if (!isNullOrUndefined(this.project_directory))
        console.log(
          `Converting to Source Format ${this.source_directory} in project directory  ${this.project_directory}`
        );
      else
        console.log(
          `Converting to Source Format ${this.source_directory} in project directory`
        );
      child_process.execSync(
        `npx sfdx force:source:convert -r ${this.source_directory}  -d  mdapi`,
        { cwd: this.project_directory, encoding: "utf8" }
      );
      console.log("Converting to Source Format Completed");
    } catch (error) {
      console.log("Unable to convert source, exiting" + error.code);
      throw error;
    }
  }

  private isEmptyFolder(source_directory): boolean {
    let files: string[] = readdirSync(source_directory);
    if (files == null || files.length === 0) return true;
    else return false;
  }
}

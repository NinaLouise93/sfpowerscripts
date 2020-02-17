import child_process = require("child_process");
import { onExit } from "../Common/OnExit";

export default class CreateScratchOrgImpl {
  public constructor(
    private working_directory: string,
    private config_file_path: string,
    private devhub: string,
    private alias: string,
    private daysToMaintain: number
  ) {}

  public async exec(command: string): Promise<any> {
    let child = child_process.exec(
      command,
      { cwd: this.working_directory, encoding: "utf8" },
      (error, stdout, stderr) => {
        if (error)
        { 
          child.stderr.on("data", data => {
            console.log(data.toString());
          });
          throw error;
        }
      }
    );

    let output = "";
    child.stdout.on("data", data => {
      console.log(data.toString());
      output += data.toString();
    });

 


    await onExit(child);

    let result = JSON.parse(output);

    return result;
  }

  public async buildExecCommand(): Promise<string> {
    let command = `npx sfdx force:org:create -v ${this.devhub} -s -f ${this.config_file_path} --json -a ${this.alias} -d ${this.daysToMaintain}`;
    return command;
  }
}

import tl = require("azure-pipelines-task-lib/task");
const fs = require("fs");

async function run() {
  try {
    //let sfdx_package: string = tl.getInput("package", true);
    //let version_number: string = tl.getInput("version_number", false);
    //let project_directory = tl.getInput("project_directory", false);
    

      let commit_id = tl.getVariable("build.sourceVersion")
      fs.writeFileSync(__dirname + "/package_version_id", commit_id);

      let data = {
        artifacttype: "container",
        artifactname: "sfdx_source_package_commit_id"
    
      }
      // upload or copy
      data["containerfolder"] = "sfdx_source_package_commit_id";

      // add localpath to ##vso command's properties for back compat of old Xplat agent
      data["localpath"] = __dirname + "/package_version_id";
      tl.command("artifact.upload", data, __dirname + "/package_version_id");
    }
   catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
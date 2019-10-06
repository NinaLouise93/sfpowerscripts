import child_process = require("child_process");
import { onExit } from "../Common/OnExit";
import { isNullOrUndefined } from "util";


export default class AnalyzeWithPMDImpl {
  public constructor(private validate_package: string,private bypass:string, private project_directory: string) {}

  public async exec(command: string): Promise<void> {
   
    let child=child_process.exec(command,  { encoding: "utf8", cwd:this.project_directory },(error,stdout,stderr)=>{

      if(error)
         throw error;
    });
   
    child.stdout.on("data",data=>{console.log(data.toString()); });
    child.stderr.on("data",data=>{console.log(data.toString()); });
    

    await onExit(child);

  }

  public async buildExecCommand(): Promise<string> {

    let command;
        command = `npx sfdx sfpowerkit:package:valid`;


    if(!isNullOrUndefined(this.validate_package))
    command+=` -n  ${this.validate_package}`;

    if(!isNullOrUndefined(this.bypass))
    command+=` -b  ${this.bypass}`;


    return command;
  }

 
}

import child_process = require("child_process");
import { onExit } from "../Common/OnExit";
import { isNullOrUndefined } from "util";



export default class InstallUnlockedPackageImpl {
  public constructor(
    private package_version_id:string,
    private targetusername:string,
    private options:any,
    private wait_time:string,
    private publish_wait_time:string
  ) {}

  public async exec(): Promise<void> {
   let command = await this.buildExecCommand();
   
   let child=child_process.exec(command,(error,stdout,stderr)=>{

    if(error)
       throw error;
  });
 
  child.stdout.on("data",data=>{console.log(data.toString()); });

  await onExit(child);

  }

  public async buildExecCommand(): Promise<string> {
     
    let command = `npx sfdx force:package:install --package ${this.package_version_id} -u ${this.targetusername} --noprompt`

    command+=` --publishwait=${this.publish_wait_time}`;
    command+=` --wait=${this.wait_time}`;
    command+=` --securitytype=${this.options['securitytype']}`;
    command+=` --upgradetype=${this.options['upgradetype']}`;
    command+=` --apexcompile=${this.options['apexcompile']}`;
    
    if(!isNullOrUndefined(this.options['installationkey']))
    command+=` --installationkey=${this.options['installationkey']}`;
  
   console.log(`Generated Command ${command}`)

   return command;

  }
}

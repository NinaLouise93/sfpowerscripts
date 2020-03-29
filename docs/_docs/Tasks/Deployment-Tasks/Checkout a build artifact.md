---
title: Checkout a build artifact
category: Deployment Tasks
subcategory: Deployment Tasks
order: 12
---

This task is used to checkout the code to a particular commit id from a GIT repo as mentioned in the build artifact produced by SFPowerscript Packaging Task. This task is used in a release pipeline to have access to the code either for a source deployment or for a pre/post deployment of an unlocked package. The repo URL and commit id are already stored in the artifact produced by Packaging Tasks. This task at the moment only supports Git providers with HTTPS access.

**Task Snapshot**

**![](/images/Checkout source from a build artifact.png){: width="838" height="408"}**

**Task Version and Details**

id: sfpwowerscript-checkoutprojectfromartifact-task

version: 8.0.1

**Input Variables&nbsp; - Visual Designer Labels (Yaml variables)**

* **Select the packaging type of the associated artifact(typeOfArtifact)**
  
   Select the associated artifact associated with this pipeline, possible values are Source Deployment(source), Delta Deployment(delta) and Unlocked Package (unlocked). This parameter is used to drive the other parameters when configuring in classic mode
  

* **Select the version control provider(versionControlProvider)**

  The version control provider that hosts the particular repo. The available options are Github (github), GitHub Enterprise (githubEnterprise), BitBucket Cloud (bitbucket), Azure Repo (azureRepo), Other Git (otherGit).

  Following are the connection types supported and have to be assigned for this command to work

  * **GitHub Connection(github\_connection)**

  Select the corresponding Github service connection from the dropdown (in the classic mode) or set the variable with appropriate connection name if used in a Yaml pipeline. Read more instruction on using connectedService [here](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&amp;tabs=yaml)

  * **GitHub Enterprise Connection(github\_enterprise\_connection)**

  Select the corresponding Github Enterprise service connection from the dropdown (in the classic mode) or set the variable with appropriate connection name if used in a Yaml pipeline. Read more instruction on using connectedService [here](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&amp;tabs=yaml)

  * **Bitbucket Connection(bitbucket\_connection)**

  Select the corresponding Bitbucket cloud service connection from the dropdown (in the classic mode) or set the variable with appropriate connection name if used in a Yaml pipeline. Read more instruction on using connectedService [here](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&amp;tabs=yaml)

  * **Azure Repo (azureRepo)**

  If azure Repo is selected, the agent has to have the setting 'Allow Script to access OAuth Token' activated in the Agent Job settings, so that the task can access $(System.AccessToken) Variable and checkout the code<br><br>![](/images/Checkout source from a build artifact_agent_additional_option.png){: width="962" height="662"}

  * **Other Git (otherGit)**

  If your repo is none of the above, then utilize this selection to pass in the username/password for a basic authentication schema to checkout the corresponding code. If this mode is selected please fill in Username (username) and Password (password) to checkout the repository\`

* ![](/images/Checkout source from a build artifact_agent_password.PNG){: width="997" height="642"}

* **Name of the source artifact that needs to be checked out(artifact)**

  The name of the artifact that is attached to this release pipeline. Please note it will only take artifact generated by Create SFDX Unlocked Package or Create Source based packaging<br><br>&nbsp;

* **Send Anonymous Usage Telemetry (isTelemetryEnabled)**

   Enable this flag to send anonymous usage telemetry to track usage and bring further improvements to this task
   
**Output Variables**

* sfpowerscripts\_checked\_out\_path

The path to the directory where the source code is checked out

**Control Options**

None

**Gotcha's**

None

**Changelog**

* 8.0.1 Patch issue with azure Repo
* 8.0.0 Add support for Delta Packaging
* 6\.0.0 Uses Service Credentials
* 5\.0.1 Updated with Telemetry
* 4\.8.0 Minor Improvements
* 2\.8.0 Initial Version
<h1>
<img alt="LegalPortal logo" src="http://nuveminc.com/img/lp-logo.png" title="LegalPortal"/>
</h1>

## SharePoint LegalPortal (beta)

LegalPortal is a SharePoint-based application that utilizes SharePoint (SP) as
the base platform for an intranet portal. The current release is in beta and
requires some initial configuration which is described in the [Installation](#installation) section
below.

This portal application uses a completely novel approach pioneeered by Nuvem Principal Consultant, Mark Pace, utilizes a SharePoint (SP) Wiki page to host an Angular-based Single Page Application (SPA to accelerate development time reducing costs dramatically. No more installing and retracting while developing the solution. The entire app can be deployed as easily as dragging and dropping files via SharePoint Designer or the SharePoint native UI. Updating the app is as simple as copying files to an existing document library (Site Assets).

**Benefits:**
 - Greatly reduces development hell of installing and retracting solutions. No more artifacts!
 - Completely portable. Can be deployed to either on-prem or to the cloud with no changes.
 - Complete separation of concerns. Presentation and server are completely decoupled.
 - Uses SharePoint as an application platform which includes Role-based access and API security out of the box, native list and library interfaces make administration of the portal simple and easy.

This project is the result of a number of portal projects developed for various
Legal Services organizations and provides basic features that were common through
all projects.

The portal application adds a simpler and more intuitive User Experience (UX) to
the out-of-the-box User Interface (UI) provided by SharePoint and was developed as
a modular application framework to allow extensible "portlets" to be developed and
added to the core set of features.

## Legal Portal Out of the Box
<img alt="LegalPortal logo" src="http://nuveminc.com/img/lp-dashboard.png" title="LegalPortal"/>

## Legal Portal Customized for LAF
<img alt="LAF LegalPortal logo" src="http://nuveminc.com/img/lp-laf-dashboard.png" title="LAF LegalPortal"/>

## Installation
You can either clone the files from this repo or download the files as a zip file.
Once you have the files, you will need to perform some SP configuration. Since a solution package has not been developed yet.

The easiest way to play with this beta is to create a new Site Collection since you will need to create a Blog sub-site and a few lists and libraries to support the application. You can use an existing site, but be aware you will be creating new lists and libraries.

>**Note:** create the list or library specified with no spaces in the name.
You can change the display name by changing the name **after** you have created the list.

>Also note that [root] refers to the "Site Collection" you are using

> The "portal" folder referenced below refers to the current versioned folder
that is in the repo (e.g. portal-v0.2.012116)  

 1. Copy the entire file folder (portal) into [root]/SiteAssets in SP ([root]/SiteAssets/portal-v0.2.012116)
 2. Copy the file LegalPortal.aspx into [root]/Site Pages in SP ([root]/Site Pages/LegalPortal.aspx)
 3. Create a Blog sub-site named "Blog" ([root]/Blog)
 4. Create a new Calendar list named "Events" ([root]/Events)
 5. Create a new Discussion list named "JudgesDecisions" ([root]/JudgesDecisions)
 7. Create a new Discussion list named "WaterCooler" ([root]/WaterCooler)
 6. Create or ensure a library named "Documents" exists ([root]/Documents)
 7. Create a new library named "HowTo" ([root]/HowTo)
 8. Create a new Custom list named "Workgroups"

You will now need to make some changes to the code to customize your specific instance of this portal. The following files can be edited using SharePoint Designer (SPD) or you can edit the files outside SP and drag them into the correct folder using SPD.

**Portal Configuration Variables**

[root]/SiteAssets/portal/config/portal.config.js

Update "subsiteUrl" value if you are using a subsite (e.g. [root]/subsite/)
```
LegalPortal.constant('BASE_PATH', {
    // name of subsite (leave trailing '/' e.g. /LegalPortal/)
    subsiteUrl:             '/',
    // DO NOT CHANGE THESE VALUES
    modulesUrl:             rootUrl + '/modules/',
    dataUrl:                rootUrl + '/data/',
    pageUrl:                rootUrl + '/app/',
    portletUrl:             rootUrl + '/global/directives/portlets/',
    images:                 rootUrl + '/lib/images/',
    globalDirectivesUrl:    rootUrl + '/global/directives/',
    globalModalsUrl:        rootUrl + '/global/modals/'
});
```

Update the below values to change the Weather and Twitter Portlets
```
LegalPortal.constant('PORTLET', {
    weatherCity: 'Seattle',
    twitterAt: 'ReutersTech',
    twitterId: '685274550158753792'
});
```
The values above are:
 - weatherCity: enter the city you wish to display
 - twitterAt: enter the name of the account (this is only for displaying while the
   tweets are loading)
 - twitterId: the ID of your twitter account - see the 'Twitter Widget Configuration'
 section below.


 ***Twitter Widget Confugration***

 Log into your Twitter account and use this link to the [Twitter Widget](https://twitter.com/settings/widgets/new) creator to view your Twitter Id.
 Click the 'Create Widget' button and copy the value from the "data-widget-id" from
  the HTML that is displayed.
 It will look something like this:


 ```
 data-widget-id="705463983336087552"
 ```

***Term Store Configuration***

Update the below values to point to your Termstore. These values can be found in the Term Store.

From 'Site Settings', click the Term store management link. Click on the site collection
node to select. On the 'General' pane to the right, at the bottom is the 'Unique Identifier'.
This is the value you will use for 'GUID' below. Each termset will also have a 'Unique Identifier'.
Select each Term Set and copy the 'Term Set Name' and the 'Unique Identifier' for the 'TERMSETS'
section below.


```
Portal.constant('TERMSTORE', {
    // GUID of the Site Collection termstore
    GUID: 'fb0add40-dde1-4939-b792-2f1a1db83c6e',
    // GUID of each of the mapped term sets
    TERMSETS: [
        { name: 'DocType', guid: 'bae365e8-2890-46da-b98e-7b4eb1446063'},
        { name: 'Groups', guid: 'e33657b5-3f90-4da4-8cf4-37e0826e67b5'},
        { name: 'Issues', guid: 'db3eefa8-b922-491d-9f7e-d97d4f119bac'},
        { name: 'TaxKeywords', guid: 'fb0add40-dde1-4939-b792-2f1a1db83c6e'}
    ]
});
```

**Workgroups Custom List**

Use the list template included to create the list.
(Workgroups-Template.stp)

>**Note: this list will only work on SharePoint 2013

To create this list:
 - Click "Site Settings"
 - Click "List templates" under "Web Designer Galleries" section.
 - In the ribbon, click the "Files" tab
 - Click "Upload Document"
 - Browse to find the file (Workgroups-Template.stp)
 - Select this file and click "Ok"
 - Click "Save" on the next dialog
 - Click "Site Contents"
 - Click "add an app"
 - Click the page button at the bottom to find "Workgroup-Template"
 - Name: "Workgroups"
 - Click "Create"

Alternatively, you can create the "Workgroups" custom list.
 - Click "Site Contents"
 - Click "add an app"
 - Click "Custom List"
 - Name: "Workgroups"
 - Click "Workgroups" list
 - In the ribbon, click the tab "List"
 - Click "List Settings"
 - Create the following columns:
  - AboutUs (Single line of text)
  - ImportantLinks (Multiple lines of text)
  - ResourceLinks (Multiple lines of text)
  - ExternalLinks (Multiple lines of text)
  - People (Multiple lines of text)
  - StateName (Single line of text)
  - DisplayTitle (Single line of text)



 > **Note: Please note no spaces in the column names.

SharePoint Version Support
---------------
This beta version supports both SharePoint 2013 On-Premises and SharePoint Online
(Office 365). The **Set-Up** section below is the same for both hosted versions.


Application Architecture
---------------
The portal architecture consists of SharePoint as the platform to provide core
services consisting of the following:

- Authentication
- Authorization
- Data storage (Lists, Libraries)
- Feature support (Blogs, Team Sites, Wikis)

The application architecture leverages several frameworks in addition to SharePoint.
The additional frameworks make up the "Presentation" layer which is defined as the
custom User Interface (UI) elements that augment the native SharePoint UI.
Technology frameworks used are:

- jQuery
- moment.js
- AngularJS
- Twitter Bootstrap

Application Design
--------
Open source framework technologies are used with SharePoint in a novel way.
Rather than implementing the custom interfaces as master pages and web parts
deployed in custom solution packages, the framework is deployed as files to a
SharePoint library. The code files (JavaScript)  are stored in standard SharePoint
libraries (Site Assets) and the main entry page "LegalPortal.aspx" is stored in the Site Pages
library as a basic Wiki page. By simplifying the deployment and file management,
development is more rapid and deployments can be made to either SP
on-premise or Office 365 (SharePoint Online).

---------

LegalPortal Features (Portlets)
------------
Portlets refer to the functional areas of the page - think of portlets as
the new "web parts". Portlets are, in reality, AngularJS Directives, so if
you want to extend the framework with new views of data, you can create a
new directive or modify or extend an existing one and place it in the view.

- Weather: displays weather for your local area
- Blog: displays blog entries stored in your blog site
- Events: displays events
- Discussion Boards
- Twitter Feed
- Document Library View
- Practice Areas Views
- Search (integration with native FAST)

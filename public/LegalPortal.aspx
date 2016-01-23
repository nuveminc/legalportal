<!DOCTYPE html>
<%@ Page Language="C#" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Import Namespace="Microsoft.SharePoint" %>
<%@ Assembly Name="Microsoft.Web.CommandUI, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<!--[if IE 8]> <html lang="en" class="ie8 no-js"> <![endif]-->
<!--[if IE 9]> <html lang="en" class="ie9 no-js"> <![endif]-->
<!--[if !IE]><!-->
<html lang="en" data-ng-app="LegalPortal">
    <!--<![endif]-->
    <!-- BEGIN HEAD -->
    <head>
<meta name="WebPartPageExpansion" content="full" />
        <meta name="WebPartPageExpansion" content="full" />
        <meta name="WebPartPageExpansion" content="full" />
        <meta charset="utf-8" />
        <title>LegalPortal | Dashboard</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="LegalPortal, SharePoint LegalPortal" name="description" />
        <meta content="Nuvem, Inc." name="author" />
        <!-- BEGIN GLOBAL MANDATORY STYLES -->
        <link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700&subset=all" rel="stylesheet" type="text/css" />
        <link href="/SiteAssets/portal-v0.2.012116/lib/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
        <link href="/SiteAssets/portal-v0.2.012116/lib/plugins/simple-line-icons/simple-line-icons.min.css" rel="stylesheet" type="text/css" />
        <link href="/SiteAssets/portal-v0.2.012116/lib/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <link href="/SiteAssets/portal-v0.2.012116/lib/plugins/chosen/css/chosen.css" rel="stylesheet" type="text/css" />
        <link href="/SiteAssets/portal-v0.2.012116/lib/plugins/text-angular/css/textAngular.css" rel="stylesheet" type="text/css" />
        <link href="/SiteAssets/portal-v0.2.012116/lib/plugins/ui-grid/css/ui-grid.css" rel="stylesheet" type="text/css" />
        <link href="/SiteAssets/portal-v0.2.012116/lib/plugins/datetimepicker/datetimepicker.css" rel="stylesheet" />
        <!-- END GLOBAL MANDATORY STYLES -->
        <!-- BEGIN THEME GLOBAL STYLES -->
        <link href="/SiteAssets/portal-v0.2.012116/lib/css/components.css" rel="stylesheet" id="style_components" type="text/css" />
        <link href="/SiteAssets/portal-v0.2.012116/lib/css/plugins.min.css" rel="stylesheet" type="text/css" />
        <!-- END THEME GLOBAL STYLES -->
        <!-- BEGIN THEME LAYOUT STYLES -->
        <link href="/SiteAssets/portal-v0.2.012116/lib/css/layout.css" rel="stylesheet" type="text/css" />
        <link href="/SiteAssets/portal-v0.2.012116/lib/css/theme.css" rel="stylesheet" type="text/css" id="style_color" />
        <link href="/SiteAssets/portal-v0.2.012116/lib/css/legalportal.css" rel="stylesheet" type="text/css" />
        <!-- END THEME LAYOUT STYLES -->
        <link rel="shortcut icon" href="favicon.ico" />
        <SharePoint:ScriptLink language="javascript" name="core.js" OnDemand="true" runat="server" Localizable="false"></SharePoint:ScriptLink>
    </head>
    <!-- END HEAD -->
    <body class="page-container-bg-solid page-boxed" data-ng-controller="mainController">
        <!-- BEGIN HEADER -->
        <div class="page-header">
            <!-- BEGIN HEADER TOP -->
            <div class="page-header-top" banner-portlet initialized="true">
            </div>
            <!-- END HEADER TOP -->
            <!-- BEGIN HEADER MENU -->
            <div data-ng-if="main.initialized">
                <div class="page-header-menu" navigation-portlet add-document="main.openModalAddDocument()" search-keywords="main.keywords" search-click="main.search()">
                </div>
            </div>
            <div class="page-header-menu" data-ng-if="!main.initialized">
                <div class="hor-menu">
                    <ul class="nav navbar-nav">
                        <li>
                            <a class="dropdown-toggle uppercase">
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- END HEADER MENU -->
        </div>
        <!-- END HEADER -->
        <!-- BEGIN CONTAINER -->
        <div class="page-container">
            <!-- BEGIN CONTENT -->
            <div class="page-content-wrapper">
                <!-- BEGIN CONTENT BODY -->
                <!-- BEGIN PAGE HEAD-->
                <div breadcrumb-portlet>
                </div>
                <!-- END PAGE HEAD-->
                <!-- BEGIN PAGE CONTENT BODY -->
                <div class="page-content">
                    <div class="container">
                        <!-- BEGIN ACTUAL CONTENT -->
                        <div data-ui-view> </div>
                        <!-- END ACTUAL CONTENT -->
                    </div>
                </div>
                <!-- END PAGE CONTENT BODY -->
                <!-- END CONTENT BODY -->
            </div>
            <!-- END CONTENT -->
        </div>
        <!-- END CONTAINER -->
        <!-- BEGIN FOOTER -->
        <!-- BEGIN PRE-FOOTER -->
        <!-- <div class="page-prefooter" data-ng-include="'/SiteAssets/portal-v0.2.012116/global/modules/footer/prefooter.html'"> -->
        </div>
        <!-- END PRE-FOOTER -->
        <!-- BEGIN INNER FOOTER -->
        <div class="page-footer">
            <div class="container"> SharePoint LegalPortal by Nuvem, Inc.</div>
        </div>
        <div class="scroll-to-top">
            <i class="icon-arrow-up"></i>
        </div>
        <form id="lp" runat="server"></form>
        <!-- END INNER FOOTER -->
        <!-- END FOOTER -->
        <!--[if lt IE 9]>
        <script src="/SiteAssets/portal-v0.2.012116/css/global/plugins/respond.min.js"></script>
        <script src="/SiteAssets/portal-v0.2.012116/css/global/plugins/excanvas.min.js"></script>
        <![endif]-->
        <script src="/SiteAssets/portal-v0.2.012116/config/constants.js" type="text/javascript"></script>
        <!-- BEGIN CORE PLUGINS -->
        <script id="twitter-wjs" src="https://platform.twitter.com/widgets.js"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/jquery.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/bootstrap-hover-dropdown/bootstrap-hover-dropdown.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/jquery-slimscroll/jquery.slimscroll.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/moment.js" type="text/javascript"></script>
        <!-- END CORE PLUGINS -->
        <!-- BEGIN CORE ANGULARJS PLUGINS -->
        <script src="/SiteAssets/portal-v0.2.012116/lib/js/angularjs/angular.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/js/angularjs/angular-sanitize.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/js/angularjs/angular-touch.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/js/angularjs/plugins/angular-ui-router.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/js/angularjs/plugins/angular-animate.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/js/angularjs/plugins/ui-bootstrap-tpls.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/js/angularjs/plugins/angular-slimscroll.js" type="text/javascript"></script>
        <!-- END CORE ANGULARJS PLUGINS -->
        <!-- BEGIN JQUERY-NG PLUGINS -->
        <!-- // <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/ui-bootstrap-tpls-0.12.0.min.js"></script> -->
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/datetimepicker/datetimepicker.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/text-angular/js/textAngular.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/text-angular/js/textAngularSetup.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/text-angular/js/textAngular-rangy.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/text-angular/js/textAngular-sanitize.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/chosen/js/chosen.jquery.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/chosen/js/chosen.angular.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/ui-grid/js/ui-grid.min.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/lib/plugins/ng-file-upload.js" type="text/javascript"></script>

        <script src="/SiteAssets/portal-v0.2.012116/lib/js/spapi.js" type="text/javascript"></script>
        <!-- END JQUERY-NG PLUGINS -->
        <!-- BEGIN APP LEVEL ANGULARJS SCRIPTS -->
        <script src="/SiteAssets/portal-v0.2.012116/app.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/config/portal.config.js" type="text/javascript"></script>
        <!-- ROUTES -->
        <script src="/SiteAssets/portal-v0.2.012116/global/routes/default.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/routes/configuration.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/routes/dashboard.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/routes/library.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/routes/workgroups.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/routes/taskforces.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/routes/staff-resources.js" type="text/javascript"></script>
        <!-- SERVICES -->
        <script src="/SiteAssets/portal-v0.2.012116/global/filters/filters.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/services/portal.utils.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/services/dataProvider.service.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/services/authorization.service.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/services/navigation.service.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/services/configuration.service.js" type="text/javascript"></script>
        <!-- DIRECTIVES -->
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/weather/weather.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/header/banner/banner.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/header/navigation/navigation.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/header/breadcrumb/breadcrumb.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/portlets/blog/blog.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/portlets/event/event.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/portlets/event/event.item.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/portlets/document/document.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/portlets/discussion/discussion.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/portlets/comment/comment.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/portlets/twitter/twitter.directive.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/global/directives/nvFileUpload.directive.js" type="text/javascript"></script>
        <!-- REPOSITORIES (SERVICES) -->
        <script src="/SiteAssets/portal-v0.2.012116/modules/config/config.repository.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/blog/blogPost.repository.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/discussions/discussion.repository.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/documentLibrary/document.repository.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/events/event.repository.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/workgroups/workgroups.repository.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/main/main.navigation.repository.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/howto/howto.repository.js" type="text/javascript"></script>
        <!-- CONTROLLERS -->
        <script src="/SiteAssets/portal-v0.2.012116/modules/config/config.default.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/main/main.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/dashboard/dashboard.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/documentLibrary/grid/gridView.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/documentLibrary/details/documentDetails.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/workgroups/workgroup.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/taskforces/taskforces.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/howto/howto.controller.js" type="text/javascript"></script>
        <!-- MODAL CONTROLLERS -->
        <script src="/SiteAssets/portal-v0.2.012116/global/modals/addComment.modal.controller.js" type="text/javascript"></script>

        <script src="/SiteAssets/portal-v0.2.012116/modules/blog/modals/blogPost.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/blog/modals/image.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/blog/modals/addBlogPost.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/events/modals/event.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/events/modals/addEvent.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/documentLibrary/modals/document.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/discussions/modals/discussion.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/workgroups/modals/aboutUs.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/workgroups/modals/catLink.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/workgroups/modals/docLink.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/workgroups/modals/extLink.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/workgroups/modals/link.modal.controller.js" type="text/javascript"></script>
        <script src="/SiteAssets/portal-v0.2.012116/modules/workgroups/modals/people.modal.controller.js" type="text/javascript"></script>        <!-- END APP LEVEL ANGULARJS SCRIPTS -->
        <script src="/SiteAssets/portal-v0.2.012116/modules/howto/modals/howto.modal.controller.js" type="text/javascript"></script>
    </body>
</html>

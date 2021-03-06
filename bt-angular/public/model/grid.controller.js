(function() {
    'use strict';

    angular
        .module('app')
        .controller('GridCtrl', GridCtrl);

    /*
    * This is the Angular controller in control of the ui-grid that displays, filters, and allows users to select security measures
    */

    /* @ngInject */
    //GridCtrl.$inject = ['UserRecords', 'SecurityMeasuresJSON', '$scope', '$filter', '$routeProvider'];
    function GridCtrl(UserRecords, SecurityMeasuresJSON, $scope, $filter) {
        /*jshint validthis: true */
        var vm = this;
        vm.title = 'GridCtrl';
		
		    vm.srcData = {}; // the original data
        vm.dispData ={}; // the data that is filtered

        vm.overlay = UserRecords.profile; // the profile from UserRecords


        vm.selectMeasure = selectMeasure;
        vm.setRow = setRow;
        vm.updateFilter = updateFilter;
        vm.measuresList = measuresList;

        vm.familyFilter = []; // data for family select box
        vm.measureFilter = []; // data for measure select box
        vm.families = [
            "ACCESS CONTROL",
            "AUDIT AND ACCOUNTABILITY",
            "AWARENESS AND TRAINING",
            "CONFIGURATION MANAGEMENT",
            "CONTINGENCY PLANNING",
            "IDENTIFICATION AND AUTHENTICATION",
            "INCIDENT RESPONSE",
            "MAINTENANCE",
            "MEDIA PROTECTION",
            "PERSONNEL SECURITY",
            "PHYSICAL AND ENVIRONMENTAL PROTECTION",
            "PLANNING",
            "Program Management",
            "RISK ASSESSMENT",
            "SECURITY ASSESSMENT AND AUTHORIZATION",
            "SYSTEM AND COMMUNICATIONS PROTECTION",
            "SYSTEM AND INFORMATION INTEGRITY",
            "SYSTEM AND SERVICES ACQUISITION"
        ];

        

        // the configuration for the ui-grid
        vm.gridOptions = {
          enablePaginationControls: true,
          //enableFiltering: true,
          enableRowSelection: true,
          multiSelect: false,
          enableRowHeaderSelection: false,
          columnDefs: [
              { field: 'uid',
                width: '8%',
              displayName: 'Measure' },
            { field: 'config.title',
            width: '37%',
              displayName: 'Title' },
            { field: 'config.priority',
               width: '8%',
              displayName: 'Priority' },
            { field: 'config.baseline', 
            width: '17%',
            displayName: 'Baseline'},
            { field: 'config.family', 
            width: '20%',
            displayName: 'Family'}
          ]
        };

        vm.gridOptions.appScopeProvider= vm;
 
        // this sets up the callback function for a selection event       
        vm.gridOptions.onRegisterApi = function(gridApi) {
          vm.gridApi = gridApi;
          vm.gridApi.selection.on.rowSelectionChanged( $scope, (function(row) {
            vm.selectMeasure(row.entity); 
          }));
          vm.gridApi.core.addRowHeaderColumn( {  name: 'rowHeaderCol', displayName: 'Status', width: 100, cellTemplate: '/layout/row-header-template.html'} );
          UserRecords.registerFocusCallback(vm.setRow);
        };
        
        vm.lookup = UserRecords.recordDict;

        activate();

        // code run on controller initialization
        function activate() {
            // collects the json object from the Security MeasuresJSON service

            var data = SecurityMeasuresJSON.getJSON();
            
              // vm.srcData = data["controls:controls"]["controls:control"];
              // vm.gridOptions.data = vm.srcData;
              
              // UserRecords.initRecords(vm.srcData);
              // UserRecords.setSysBaseline();
            UserRecords.initRecords(data);
            UserRecords.setSysBaseline();
            vm.srcData = [];
            angular.forEach(UserRecords.parentSubSet(), function(value, index) {
                                                vm.srcData.push(value);
                                            });
            vm.gridOptions.data = vm.srcData;
            

            vm.lookup = UserRecords.recordDict;
        }

        /*
        * This is the callback that updates the rows
        * It is a linear algorithm
        * I do not like it (slightly inefficient)
        */

        function setRow() {
          vm.gridApi.selection.clearSelectedRows();
          for(var i = 0; i < vm.gridApi.grid.rows.length; i ++) {
            if(UserRecords.focusRecord.uid === vm.gridApi.grid.rows[i].entity.uid) {
              vm.gridApi.selection.toggleRowSelection(vm.gridApi.grid.rows[i].entity);
              break;
            }
          }
        }

        // the call back for selection
       function selectMeasure(row) {
            if(row.uid !== UserRecords.focusRecord.uid) {
              UserRecords.focusID(row.uid); 
            }
        }

        // returns all of the measures in a certain family
        function measuresList() {
           return $filter('familyFilter')(vm.srcData, vm.familyFilter);
        }

        // returns all of the measures/enhancements in a certain family of list of measures
        function updateFilter() { 
          if(vm.familyFilter.length === 0) {
            vm.measureFilter = [];
          }
          vm.dispData = $filter('measureFilter')( $filter('familyFilter')(vm.srcData, vm.familyFilter), vm.measureFilter);
          if(vm.dispData.length === 0) {
            vm.measureFilter = [];
            vm.dispData = $filter('measureFilter')( $filter('familyFilter')(vm.srcData, vm.familyFilter), vm.measureFilter);
          }
          vm.gridOptions.data = vm.dispData;
        }
        
    }
})();
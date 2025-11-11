// /*
//  * DHtmlX Gantt Initialization Script for Kanboard
//  */

// document.addEventListener('DOMContentLoaded', function() {
//     console.log('DOM loaded, initializing DHtmlX Gantt...')
    
//     // Initialize DHtmlX Gantt
//     var initialized = initDhtmlxGantt();
    
//     if (!initialized) {
//         console.error('Failed to initialize DHtmlX Gantt');
//         return;
//     }
    
//     // Load task data - this will be set by the template
//     if (typeof window.taskData !== 'undefined') {
//         console.log('Task data:', window.taskData);
//         console.log('Task count:', window.taskData && window.taskData.data ? window.taskData.data.length : 'No data structure');
//         loadGanttData(window.taskData);
//     } else {
//         console.warn('No task data found on window.taskData');
//         // Load empty data to show the interface
//         loadGanttData({data: [], links: []});
//     }
    
//     // Setup event handlers
//     setupGanttEventHandlers();
// });

// function initDhtmlxGantt() {
//     // Check if DHtmlX Gantt library is loaded
//     if (typeof gantt === 'undefined') {
//         console.error('DHtmlX Gantt library not loaded!');
//         return false;
//     }
    
//     // Check if the container element exists
//     var container = document.getElementById('dhtmlx-gantt-chart');
//     if (!container) {
//         console.error('Gantt container element not found! Looking for #dhtmlx-gantt-chart');
//         return false;
//     }
    
//     console.log('Initializing DHtmlX Gantt...', container);
    
//     // Configure DHtmlX Gantt
//     gantt.config.date_format = "%Y-%m-%d %H:%i";
//     gantt.config.xml_date = "%Y-%m-%d %H:%i";
//     gantt.config.scale_unit = "day";
//     gantt.config.date_scale = "%d %M";
//     gantt.config.subscales = [
//         {unit: "hour", step: 1, date: "%H"}
//     ];
    
//     // Ensure grid is visible
//     gantt.config.grid_width = 400;
//     gantt.config.show_grid = true;
    
//     // Enable plugins
//     gantt.plugins({
//         tooltip: true,
//         keyboard_navigation: true,
//         undo: true
//     });
    
//     // Configure columns
//     gantt.config.columns = [
//         {name: "text", label: "Task Name", tree: true, width: 200, resize: true},
//         {name: "start_date", label: "Start Date", align: "center", width: 100, resize: true},
//         {name: "duration", label: "Duration", align: "center", width: 60, resize: true},
//         {name: "progress", label: "Progress", align: "center", width: 80, resize: true},
//         {name: "priority", label: "Priority", align: "center", width: 80, resize: true},
//         {name: "add", label: "", width: 44}
//     ];
    
//     // Custom task styling
//     gantt.templates.task_class = function(start, end, task) {
//         var className = "";
//         if (task.priority) {
//             className += "dhtmlx-priority-" + task.priority + " ";
//         }
//         if (task.readonly) {
//             className += "dhtmlx-readonly ";
//         }
//         return className;
//     };
    
//     // Progress template
//     gantt.templates.progress_text = function(start, end, task) {
//         return "<span>" + Math.round(task.progress * 100) + "% </span>";
//     };
    
//     // Tooltip template
//     gantt.templates.tooltip_text = function(start, end, task) {
//         return "<b>Task:</b> " + task.text + "<br/>" +
//                "<b>Start:</b> " + gantt.templates.tooltip_date_format(start) + "<br/>" +
//                "<b>End:</b> " + gantt.templates.tooltip_date_format(end) + "<br/>" +
//                "<b>Progress:</b> " + Math.round(task.progress * 100) + "%<br/>" +
//                "<b>Priority:</b> " + (task.priority || 'normal');
//     };
    
//     // Initialize Gantt
//     try {
//         gantt.init("dhtmlx-gantt-chart");
//         console.log('DHtmlX Gantt initialized successfully');
//         return true;
//     } catch (error) {
//         console.error('Error initializing DHtmlX Gantt:', error);
//         return false;
//     }
// }

// function loadGanttData(data) {
//     console.log('Loading Gantt data...', data);
    
//     if (data && data.data) {
//         console.log('Using data.data format, tasks:', data.data.length);
//         gantt.parse(data);
//     } else if (Array.isArray(data)) {
//         console.log('Using array format, tasks:', data.length);
//         gantt.parse({data: data, links: []});
//     } else {
//         console.log('No valid data, creating empty gantt');
//         gantt.parse({data: [], links: []});
//     }
    
//     updateStatistics();
// }

// function setupGanttEventHandlers() {
//     // Data processor for CRUD operations - URLs will be set by template
//     if (typeof window.ganttUrls !== 'undefined') {
//         var dp = new gantt.dataProcessor({
//             task: {
//                 update: window.ganttUrls.update,
//                 create: window.ganttUrls.create,
//                 delete: window.ganttUrls.remove
//             },
//             link: {
//                 create: window.ganttUrls.createLink,
//                 delete: window.ganttUrls.removeLink
//             }
//         });
//         dp.init(gantt);
//     }
    
//     // Toolbar event handlers
//     var addTaskBtn = document.getElementById('dhtmlx-add-task');
//     if (addTaskBtn) {
//         addTaskBtn.addEventListener('click', function() {
//             gantt.createTask();
//         });
//     }
    
//     var zoomInBtn = document.getElementById('dhtmlx-zoom-in');
//     if (zoomInBtn) {
//         zoomInBtn.addEventListener('click', function() {
//             gantt.ext.zoom.zoomIn();
//         });
//     }
    
//     var zoomOutBtn = document.getElementById('dhtmlx-zoom-out');
//     if (zoomOutBtn) {
//         zoomOutBtn.addEventListener('click', function() {
//             gantt.ext.zoom.zoomOut();
//         });
//     }
    
//     var fitBtn = document.getElementById('dhtmlx-fit');
//     if (fitBtn) {
//         fitBtn.addEventListener('click', function() {
//             gantt.ext.zoom.setLevel("month");
//         });
//     }
    
//     // View mode buttons
//     document.querySelectorAll('.btn-dhtmlx-view').forEach(function(btn) {
//         btn.addEventListener('click', function() {
//             // Remove active class from all buttons
//             document.querySelectorAll('.btn-dhtmlx-view').forEach(function(b) {
//                 b.classList.remove('active');
//             });
//             // Add active class to clicked button
//             this.classList.add('active');
            
//             // Change view mode
//             const view = this.getAttribute('data-view');
//             changeViewMode(view);
//         });
//     });
    
//     // Update statistics when tasks change
//     gantt.attachEvent("onAfterTaskUpdate", updateStatistics);
//     gantt.attachEvent("onAfterTaskAdd", updateStatistics);
//     gantt.attachEvent("onAfterTaskDelete", updateStatistics);
// }

// function changeViewMode(mode) {
//     switch(mode) {
//         case 'Quarter Day':
//             gantt.config.scale_unit = "hour";
//             gantt.config.date_scale = "%H";
//             gantt.config.subscales = [{unit: "minute", step: 15, date: "%i"}];
//             break;
//         case 'Half Day':
//             gantt.config.scale_unit = "hour";
//             gantt.config.date_scale = "%H";
//             gantt.config.subscales = [{unit: "minute", step: 30, date: "%i"}];
//             break;
//         case 'Day':
//             gantt.config.scale_unit = "day";
//             gantt.config.date_scale = "%d %M";
//             gantt.config.subscales = [{unit: "hour", step: 1, date: "%H"}];
//             break;
//         case 'Week':
//             gantt.config.scale_unit = "week";
//             gantt.config.date_scale = "Week #%W";
//             gantt.config.subscales = [{unit: "day", step: 1, date: "%d %M"}];
//             break;
//         case 'Month':
//             gantt.config.scale_unit = "month";
//             gantt.config.date_scale = "%F %Y";
//             gantt.config.subscales = [{unit: "day", step: 1, date: "%d"}];
//             break;
//     }
//     gantt.render();
// }

// function updateStatistics() {
//     var tasks = gantt.getTaskByTime();
//     var completed = 0;
//     var inProgress = 0;
    
//     tasks.forEach(function(task) {
//         if (task.progress >= 1) {
//             completed++;
//         } else if (task.progress > 0) {
//             inProgress++;
//         }
//     });
    
//     var completedElement = document.getElementById('dhtmlx-completed-count');
//     var progressElement = document.getElementById('dhtmlx-progress-count');
    
//     if (completedElement) completedElement.textContent = completed;
//     if (progressElement) progressElement.textContent = inProgress;
// }




/*
 * DHtmlX Gantt Initialization Script for Kanboard
 */

// Store users and groups data globally (defined early)
window.projectUsers = [];
window.projectGroups = [];
window.groupMemberMap = {};

// Fetch project members (users and groups) for assignment dropdowns
function fetchProjectMembers(projectId) {
    var url = '?controller=TaskGanttController&action=getProjectMembers&plugin=DhtmlGantt&project_id=' + projectId;
    console.log('Fetching project members from:', url);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(function(response) {
        console.log('Fetch response status:', response.status);
        return response.text(); // Get text first to debug
    })
    .then(function(text) {
        console.log('Response text:', text.substring(0, 500));
        var data = JSON.parse(text);
        if (data.result === 'ok') {
            console.log('Project members loaded:', data);
            window.projectUsers = data.users;
            window.projectGroups = data.groups;
            
            // Build group member map for cascading dropdowns
            window.groupMemberMap = {};
            data.groups.forEach(function(group) {
                window.groupMemberMap[group.key] = group.members || [];
            });
            
            // Update lightbox sections with the fetched data
            updateLightboxAssignmentOptions();
        } else {
            console.error('Failed to load project members:', data);
        }
    })
    .catch(function(error) {
        console.error('Error fetching project members:', error);
    });
}

// Update lightbox dropdown options with fetched users and groups
function updateLightboxAssignmentOptions() {
    var sections = gantt.config.lightbox.sections;
    
    for (var i = 0; i < sections.length; i++) {
        if (sections[i].name === 'group') {
            sections[i].options = window.projectGroups;
        } else if (sections[i].name === 'assignee') {
            sections[i].options = window.projectUsers;
        }
    }
    
    console.log('Lightbox assignment options updated');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for DHtmlX Gantt container...');
    
    // Get the container element
    var container = document.getElementById('dhtmlx-gantt-chart');
    if (!container) {
        // Not on Gantt page - this is expected, skip initialization
        console.debug('Gantt container not found - skipping initialization (not on Gantt page)');
        return;
    }
    // ✅ Old group-by dropdown removed (now using client-side dropdown in toolbar)
    
    console.log('Gantt container found, initializing DHtmlX Gantt...');
    
    // Initialize DHtmlX Gantt
    var initialized = initDhtmlxGantt();
    
    if (!initialized) {
        console.error('Failed to initialize DHtmlX Gantt');
        return;
    }
    
    // Load task data from data attribute
    var taskDataString = container.getAttribute('data-tasks');
    // var taskData = null;
    
    // try {
    //     if (taskDataString) {
    //         taskData = JSON.parse(taskDataString);
    //         console.log('Task data loaded from attribute:', taskData);
    //         console.log('Task count:', taskData && taskData.data ? taskData.data.length : 'No data structure');
    //     }
    // } catch (e) {
    //     console.error('Failed to parse task data:', e);
    // }
    
    // if (taskData && taskData.data && taskData.data.length > 0) {
    //     loadGanttData(taskData);
    // } else {
    //     console.warn('No task data found, loading empty chart');
    //     loadGanttData({data: [], links: []});
    // }

    // Load task data from window.taskData (set by inline script in template)

    
    try {
        if (taskDataString) {
            taskData = JSON.parse(taskDataString);
            console.log('Task data loaded from attribute:', taskData);
            console.log('Task count:', taskData && taskData.data ? taskData.data.length : 'No data structure');
        } else {
            console.warn('No data-tasks attribute found');
        }
    } catch (e) {
        console.error('Failed to parse task data:', e);
    }
    
    if (taskData && taskData.data && taskData.data.length > 0) {
        loadGanttData(taskData);
    } else {
        console.warn('No task data found, loading empty chart');
        loadGanttData({data: [], links: []});
    }
    // ✅ No initial grouping - user controls via dropdown

    
    // Setup URLs from data attributes
    window.ganttUrls = {
        update: container.getAttribute('data-update-url'),
        create: container.getAttribute('data-create-url'),
        remove: container.getAttribute('data-remove-url'),
        createLink: container.getAttribute('data-create-link-url'),
        removeLink: container.getAttribute('data-remove-link-url')
    };
    
    // Fetch project members (users and groups) for assignment dropdowns
    var projectId = container.getAttribute('data-project-id');
    if (projectId) {
        fetchProjectMembers(projectId);
    }
    
    // Setup event handlers
    setupGanttEventHandlers();
});


function initDhtmlxGantt() {
    // Check if DHtmlX Gantt library is loaded
    if (typeof gantt === 'undefined') {
        console.error('DHtmlX Gantt library not loaded!');
        return false;
    }
    
    // Check if the container element exists
    var container = document.getElementById('dhtmlx-gantt-chart');
    if (!container) {
        console.error('Gantt container element not found! Looking for #dhtmlx-gantt-chart');
        return false;
    }
    
    console.log('Initializing DHtmlX Gantt...', container);
    
    // Configure DHtmlX Gantt with NEW scale configuration format
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.xml_date = "%Y-%m-%d %H:%i";
    
    // NEW scale configuration format (fixes deprecation warnings) - Default to Week view
    gantt.config.scales = [
        {unit: "week", step: 1, format: "Week #%W"},
        {unit: "day", step: 1, format: "%d %M"}
    ];
    
    // Ensure grid is visible
    gantt.config.grid_width = 400;
    gantt.config.show_grid = true;
    
    // ✅ TIME PRECISION: Allow precise time adjustments when dragging
    gantt.config.round_dnd_dates = false;  // Don't round dates during drag-and-drop
    gantt.config.time_step = 60;  // 60 minutes = 1 hour precision
    gantt.config.duration_unit = "day";  // Duration is in days
    gantt.config.duration_step = 1;  // Minimum duration step
    
    // Enable plugins
    gantt.plugins({
        tooltip: true,
        keyboard_navigation: true,
        undo: true
        // NOTE: grouping and auto_scheduling are PRO features, not available in GPL
    });
    
    // Enable drag for links
    gantt.config.drag_links = true;
    gantt.config.show_links = true;
    
    // Configure link types
    gantt.config.types = {
        task: "task",
        project: "project",
        milestone: "milestone"
    };
    
    console.log('✅ Gantt configured (GPL version - manual dependency movement)');






    
    
    // Configure columns
    gantt.config.columns = [
        {name: "text", label: "Task Name", tree: true, width: 200, resize: true},
        {name: "start_date", label: "Start Date", align: "center", width: 100, resize: true},
        {name: "duration", label: "Duration", align: "center", width: 60, resize: true},
        {name: "progress", label: "Progress", align: "center", width: 80, resize: true},
        {name: "priority", label: "Priority", align: "center", width: 80, resize: true},
        {name: "add", label: "", width: 44}
    ];
    
    //new
    gantt.templates.task_class = function(start, end, task) {
        var className = "";
        
        // Milestone takes priority over other styling
        if (task.is_milestone) {
            className += "milestone-block ";
        } else if (task.task_type === 'sprint' || task.type === 'project') {
            className += "sprint-block ";
        } else if (task.priority) {
            className += "dhtmlx-priority-" + task.priority + " ";
        }
        
        if (task.readonly) {
            className += "dhtmlx-readonly ";
        }
        
        return className;
    };
    
    // Progress template
    gantt.templates.progress_text = function(start, end, task) {
        return "<span>" + Math.round(task.progress * 100) + "% </span>";
    };
    
    // Task text template - show task name and assignee on the bar
    gantt.templates.task_text = function(start, end, task) {
        if (task.is_milestone) {
            return "M";
        }
        // Show task name with assignee if available
        if (task.assignee && task.assignee.trim() !== '' && task.assignee !== 'Unassigned') {
            return task.text + ' (' + task.assignee + ')';
        }
        return task.text;
    };
    
    // ✅ Show assignee name to the RIGHT of the bar
    gantt.templates.rightside_text = function(start, end, task) {
        if (task.assignee && task.assignee.trim() !== '') {
            return task.assignee;
        }
        return "";
    };
    
    // Tooltip template
    gantt.templates.tooltip_text = function(start, end, task) {
        var tooltip = "<b>" + (task.is_milestone ? "Milestone" : "Task") + ":</b> " + task.text + "<br/>" +
               "<b>Start:</b> " + gantt.templates.tooltip_date_format(start) + "<br/>" +
               "<b>End:</b> " + gantt.templates.tooltip_date_format(end) + "<br/>" +
               "<b>Progress:</b> " + Math.round(task.progress * 100) + "%<br/>";
        
        if (!task.is_milestone) {
            tooltip += "<b>Priority:</b> " + (task.priority || 'normal');
        }
        
        // Add assignee info to tooltip
        if (task.assignee && task.assignee.trim() !== '') {
            tooltip += "<br/><b>Assignee:</b> " + task.assignee;
        }
        
        return tooltip;
    };
    //new



    // new code for lightbox + link to kb
    // Configure lightbox sections to add "View in Kanboard" button
gantt.config.lightbox.sections = [
    {name: "type", height: 22, map_to: "task_type", type: "select", options: [
        {key: "task", label: "Task"},
        {key: "milestone", label: "Milestone"},
        {key: "sprint", label: "Sprint"}
    ]},
    {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
    {name: "tasks", height: 22, map_to: "child_tasks", type: "template"},
    {name: "group", height: 22, map_to: "group_id", type: "select", options: []},
    {name: "assignee", height: 22, map_to: "owner_id", type: "select", options: []},
    {name: "priority", height: 22, map_to: "priority", type: "select", options: [
        {key: "low", label: "Low"},
        {key: "normal", label: "Normal"},
        {key: "medium", label: "Medium"},
        {key: "high", label: "High"}
    ]},
    {name: "time", type: "duration", map_to: "auto"},
    {name: "kanboard_link", height: 40, type: "template", map_to: "my_template"}
];

// Custom labels for lightbox sections
gantt.locale.labels.section_type = "Type";
gantt.locale.labels.section_tasks = "Tasks";
gantt.locale.labels.section_group = "Group/Sprint";
gantt.locale.labels.section_assignee = "Assign To";
gantt.locale.labels.section_kanboard_link = "Quick Actions";

// Set default values for new tasks
gantt.attachEvent("onBeforeLightbox", function(id) {
    var task = gantt.getTask(id);
    
    // Check if this is a new task (temporary ID) or existing task
    var isNewTask = (typeof id === 'string' && id.toString().indexOf('$') === 0) || 
                    (typeof id === 'number' && id < 0) ||
                    !task.id || task.id === id; // DHtmlX uses $ prefix or negative IDs for new tasks
    
    console.log('onBeforeLightbox for task:', id, 'isNewTask:', isNewTask, 'owner_id:', task.owner_id);
    
    // Set default priority to "normal" if not already set
    if (!task.priority) {
        task.priority = "normal";
    }
    
    // Set default owner_id to 0 (unassigned) if not set
    if (task.owner_id === undefined || task.owner_id === null) {
        task.owner_id = 0;
    }
    
    // Set default group_id to 0 (All Users) if not set
    if (task.group_id === undefined || task.group_id === null) {
        task.group_id = 0;
    }
    
    // Set task_type based on existing properties
    if (!task.task_type) {
        if (task.is_milestone) {
            task.task_type = 'milestone';
        } else if (task.type === 'project') {
            task.task_type = 'sprint';
        } else {
            task.task_type = 'task';
        }
    }
    
    // Set child_tasks array if not exists
    if (!task.child_tasks) {
        task.child_tasks = [];
    }
    
    // Store isNewTask flag for later use
    task._isNewTask = isNewTask;
    
    // Add class to lightbox to control Type field visibility via CSS (no flash!)
    setTimeout(function() {
        var lightbox = document.querySelector('.gantt_cal_light');
        if (lightbox) {
            if (isNewTask) {
                lightbox.classList.add('gantt-new-task');
                console.log('Added gantt-new-task class for new task');
            } else {
                lightbox.classList.remove('gantt-new-task');
                console.log('Removed gantt-new-task class for existing task');
            }
            // Control Sprint Tasks visibility via CSS to avoid flash
            if (task.task_type === 'sprint') {
                lightbox.classList.add('gantt-show-sprint-tasks');
            } else {
                lightbox.classList.remove('gantt-show-sprint-tasks');
            }
            // Control Milestone visibility (hide group/assignee/priority) via CSS to avoid flash
            if (task.task_type === 'milestone' || task.is_milestone === true) {
                lightbox.classList.add('gantt-type-milestone');
            } else {
                lightbox.classList.remove('gantt-type-milestone');
            }
        }
    }, 0); // Use 0 delay for immediate execution
    
    console.log('After processing, is_milestone:', task.is_milestone, 'owner_id:', task.owner_id);
    
    return true;
});

// Note: onAfterLightbox removed - setting the value in setupLightboxFieldToggle instead
// This avoids conflicts with the main initialization logic

// Watch for lightbox to appear and handle milestone field hiding + cascading dropdowns
var lightboxObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && node.classList && node.classList.contains('gantt_cal_light')) {
                console.log('Lightbox detected!');
                
                setTimeout(function() {
                    setupLightboxFieldToggle();
                    setupCascadingAssignmentDropdowns();
                }, 100);
            }
        });
    });
});

// Start observing the document for lightbox
lightboxObserver.observe(document.body, {
    childList: true,
    subtree: true
});

function setupLightboxFieldToggle(retryCount) {
    retryCount = retryCount || 0;
    
    var lightbox = document.querySelector('.gantt_cal_light');
    
    if (!lightbox && retryCount < 10) {
        setTimeout(function() {
            setupLightboxFieldToggle(retryCount + 1);
        }, 50);
        return;
    }
    
    if (!lightbox) {
        console.log('Lightbox not found after retries');
        return;
    }
    
    console.log('Lightbox found, looking for type select...');
    
    var taskId = gantt.getSelectedId();
    var task = taskId ? gantt.getTask(taskId) : null;
    
    var typeSelect = lightbox.querySelector('select[title="type"]');
    
    if (!typeSelect) {
        if (retryCount < 10) {
            setTimeout(function() {
                setupLightboxFieldToggle(retryCount + 1);
            }, 50);
        }
        return;
    }
    
    console.log('Type select found!');
    
    var shouldBeMilestone = false;
    if (taskId && task && task.is_milestone) {
        shouldBeMilestone = true;
    }
    
    // Remove any existing listeners by cloning
    var newTypeSelect = typeSelect.cloneNode(true);
    
    // Set the value on the CLONED element based on task properties
    var taskType = task ? (task.task_type || (task.is_milestone ? 'milestone' : 'task')) : 'task';
    newTypeSelect.value = taskType;
    console.log('Set type select to:', taskType, 'for task:', taskId);
    
    typeSelect.parentNode.replaceChild(newTypeSelect, typeSelect);
    typeSelect = newTypeSelect;
    
    // Function to toggle fields based on type
    var toggleFields = function() {
        var selectedType = typeSelect.value; // "task", "milestone", or "sprint"
        
        console.log('Toggling fields, type:', selectedType);
        
        // Scope to the lightbox markup
        var lightbox = document.querySelector('.gantt_cal_light');
        if (!lightbox) return;

        // Find all sections
        var allLabels = lightbox.querySelectorAll('.gantt_cal_lsection');
        
        // Hide/show Priority (hidden for Milestone and Sprint)
        var hidePriority = (selectedType === 'milestone' || selectedType === 'sprint');
        for (var i = 0; i < allLabels.length; i++) {
            if (allLabels[i].textContent.trim() === 'Priority') {
                var prLabel = allLabels[i];
                var prContent = prLabel.nextElementSibling;
                if (prLabel) prLabel.style.display = hidePriority ? 'none' : '';
                if (prContent) prContent.style.display = hidePriority ? 'none' : '';
                console.log('Priority hidden:', hidePriority);
                break;
            }
        }
        
        // Control Tasks section with a class to avoid flash
        if (selectedType === 'sprint') {
            lightbox.classList.add('gantt-show-sprint-tasks');
        } else {
            lightbox.classList.remove('gantt-show-sprint-tasks');
        }
        // Toggle milestone class to hide group/assignee/priority without flicker
        if (selectedType === 'milestone') {
            lightbox.classList.add('gantt-type-milestone');
        } else {
            lightbox.classList.remove('gantt-type-milestone');
        }

        // Hide duration input for Milestone (keep visible for Task and Sprint)
        var hideDuration = (selectedType === 'milestone');
        var durationCandidates = lightbox.querySelectorAll(
            '.gantt_time input[type="number"],\
             .gantt_time input[aria-label="Duration"],\
             .gantt_time input[id*="duration"],\
             .gantt_time .gantt_duration input,\
             .gantt_time .gantt_duration_value'
        );
        durationCandidates.forEach(function(inp){
            if (inp && inp.style) inp.style.display = hideDuration ? 'none' : '';
            var wrap = inp.closest('.gantt_duration, .gantt_duration_line, .gantt_time_duration');
            if (wrap && wrap !== lightbox) wrap.style.display = hideDuration ? 'none' : '';
        });
    };
    
    // Apply on load
    toggleFields();
    
    // Apply on change
    typeSelect.addEventListener('change', function() {
        console.log('Type changed to:', typeSelect.value);
        toggleFields();
    });
}

// Setup cascading dropdown logic: when group changes, filter assignee dropdown
function setupCascadingAssignmentDropdowns(retryCount) {
    retryCount = retryCount || 0;
    
    var lightbox = document.querySelector('.gantt_cal_light');
    
    if (!lightbox && retryCount < 10) {
        setTimeout(function() {
            setupCascadingAssignmentDropdowns(retryCount + 1);
        }, 50);
        return;
    }
    
    if (!lightbox) {
        console.log('Lightbox not found for cascading dropdowns');
        return;
    }
    
    // Wait for data to be loaded
    if ((!window.projectUsers || window.projectUsers.length === 0) && retryCount < 20) {
        console.log('Waiting for project members data... retry', retryCount);
        setTimeout(function() {
            setupCascadingAssignmentDropdowns(retryCount + 1);
        }, 100);
        return;
    }
    
    console.log('Setting up cascading dropdowns with', window.projectUsers.length, 'users and', window.projectGroups.length, 'groups');
    
    var taskId = gantt.getSelectedId();
    var groupSelect = lightbox.querySelector('select[title="group"]');
    var assigneeSelect = lightbox.querySelector('select[title="assignee"]');
    
    if (!groupSelect || !assigneeSelect) {
        console.log('Group or assignee select not found:', {group: !!groupSelect, assignee: !!assigneeSelect});
        if (retryCount < 20) {
            setTimeout(function() {
                setupCascadingAssignmentDropdowns(retryCount + 1);
            }, 50);
        }
        return;
    }
    
    console.log('Cascading dropdowns found!');
    
    // Manually populate the dropdowns since DHtmlX might not have done it yet
    if (groupSelect.options.length === 0 && window.projectGroups.length > 0) {
        console.log('Manually populating group dropdown');
        window.projectGroups.forEach(function(group) {
            var option = document.createElement('option');
            option.value = group.key;
            option.textContent = group.label;
            groupSelect.appendChild(option);
        });
    }
    
    if (assigneeSelect.options.length === 0 && window.projectUsers.length > 0) {
        console.log('Manually populating assignee dropdown');
        window.projectUsers.forEach(function(user) {
            var option = document.createElement('option');
            option.value = user.key;
            option.textContent = user.label;
            assigneeSelect.appendChild(option);
        });
    }
    
    // Store the original assignee value
    var task = taskId ? gantt.getTask(taskId) : null;
    var originalAssignee = task ? (task.owner_id || 0) : 0;
    
    // Function to filter assignee dropdown based on selected group
    var filterAssignees = function() {
        var selectedGroupId = parseInt(groupSelect.value) || 0;
        console.log('Group changed to:', selectedGroupId);
        
        // Get members of the selected group
        var allowedMembers = window.groupMemberMap[selectedGroupId] || [];
        
        // If "All Users" (0) is selected, show all users
        if (selectedGroupId === 0) {
            allowedMembers = window.projectUsers.map(function(u) { return u.key; });
        }
        
        console.log('Allowed members:', allowedMembers);
        
        // Clear and repopulate assignee dropdown
        assigneeSelect.innerHTML = '';
        
        window.projectUsers.forEach(function(user) {
            // Show user if they're in the allowed list or if it's the "Unassigned" option
            if (user.key === 0 || allowedMembers.indexOf(user.key) !== -1) {
                var option = document.createElement('option');
                option.value = user.key;
                option.textContent = user.label;
                assigneeSelect.appendChild(option);
            }
        });
        
        // Try to restore the original assignee if still in the list
        if (originalAssignee && allowedMembers.indexOf(originalAssignee) !== -1) {
            assigneeSelect.value = originalAssignee;
        } else {
            // Default to "Unassigned" if original assignee is not in the filtered list
            assigneeSelect.value = 0;
        }
        
        console.log('Assignee dropdown updated, selected:', assigneeSelect.value);
    };
    
    // Set initial group based on task's assignee
    if (task && task.owner_id) {
        // Find which group contains this user
        for (var groupId in window.groupMemberMap) {
            if (window.groupMemberMap[groupId].indexOf(task.owner_id) !== -1) {
                groupSelect.value = groupId;
                break;
            }
        }
    }
    
    // Apply initial filter
    filterAssignees();
    
    // Add event listener for group changes
    groupSelect.addEventListener('change', filterAssignees);
}

// Handle task/milestone/sprint save
gantt.attachEvent("onLightboxSave", function(id, task, is_new) {
    console.log('Lightbox save, task:', task);
    console.log('Task type:', task.task_type, 'owner_id:', task.owner_id, 'child_tasks:', task.child_tasks);
    
    // Ensure owner_id is properly set (convert string to integer if needed)
    if (task.owner_id !== undefined && task.owner_id !== null) {
        task.owner_id = parseInt(task.owner_id) || 0;
    }
    
    // Validation: Only regular tasks must be assigned. Milestones and Sprints can be unassigned.
    if (task.task_type === 'task' && (!task.owner_id || task.owner_id === 0)) {
        alert('Error: Task must be assigned to a user. Please select someone from the "Assign To" dropdown.');
        console.error('Validation failed: Task must be assigned to a user');
        return false; // Prevent saving
    }
    
    // Validation: Sprints must have at least one child task
    if (task.task_type === 'sprint' && (!task.child_tasks || task.child_tasks.length === 0)) {
        alert('Error: Sprint must contain at least one task. Please select tasks from the "Tasks" dropdown.');
        console.error('Validation failed: Sprint must contain at least one task');
        return false; // Prevent saving
    }
    
    // Set display type and color based on task_type
    if (task.task_type === 'sprint') {
        task.type = "project"; // DHtmlX displays this as a parent bar
        task.color = "#9b59b6"; // Purple color for sprints
        task.is_milestone = false;
        console.log('Set Sprint with purple color');
    } else if (task.task_type === 'milestone') {
        task.type = "task";
        task.color = "#27ae60"; // Green for milestones
        task.is_milestone = true;
        console.log('Set Milestone with green color');
    } else {
        task.type = "task";
        task.is_milestone = false;
        console.log('Set regular Task');
    }
    
    return true; // Allow saving
});

gantt.form_blocks["template"] = {
    render: function(sns) {
        return "<div class='gantt_cal_ltext' style='height:" + sns.height + "px;'></div>";
    },
    set_value: function(node, value, task, section) {
        var projectId = document.getElementById('dhtmlx-gantt-chart').getAttribute('data-project-id');
        
        // Handle Tasks multi-select (for Sprints)
        if (section.name === 'tasks') {
            node.innerHTML = '';
            // mark this content node so CSS can target it (hide/show without flash)
            node.classList.add('sprint-tasks-block');
            
            // Get all tasks in the project
            var allTasks = gantt.getTaskByTime();
            var currentTaskId = task.id;
            var selectedTasks = task.child_tasks || [];
            // expose selection to get_value
            node._selectedTasks = Array.isArray(selectedTasks) ? selectedTasks.slice() : [];
            
            // Create container
            var container = document.createElement('div');
            container.style.cssText = 'position: relative; width: 100%;';
            
            // Create search input as the main dropdown trigger
            var searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search and select tasks...';
            searchInput.style.cssText = 'width: 100%; padding: 6px; border: 1px solid #ccc; box-sizing: border-box; background: white;';
            
            // Create dropdown panel (hidden by default)
            var dropdownPanel = document.createElement('div');
            dropdownPanel.style.cssText = 'display: none; position: absolute; left: 0; right: 0; width: 100%; max-height: 200px; overflow-y: auto; border: 1px solid #ccc; border-top: 1px solid #ddd; background: white; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15);';
            
            // Store task items for filtering
            var taskItems = [];
            var taskMap = {};
            
            if (allTasks.length === 0) {
                dropdownPanel.innerHTML = '<p style="color: #999; padding: 10px; margin: 0;">No tasks available</p>';
            } else {
                allTasks.forEach(function(t) {
                    // Don't include the current task itself or other sprints
                    if (t.id === currentTaskId || t.task_type === 'sprint') return;
                    
                    taskMap[t.id] = t;
                    
                    var option = document.createElement('div');
                    option.style.cssText = 'padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0;';
                    option.textContent = t.text + ' (' + (t.assignee || 'Unassigned') + ')';
                    option.dataset.taskId = t.id;
                    option.dataset.taskText = t.text.toLowerCase();
                    option.dataset.taskAssignee = (t.assignee || 'unassigned').toLowerCase();
                    
                    if (selectedTasks.indexOf(t.id) !== -1) {
                        option.style.backgroundColor = '#e3f2fd';
                        option.style.fontWeight = 'bold';
                    }
                    
                    option.addEventListener('click', function() {
                        var taskId = parseInt(this.dataset.taskId);
                        var idx = selectedTasks.indexOf(taskId);
                        
                        if (idx === -1) {
                            // Add to selection
                            selectedTasks.push(taskId);
                            this.style.backgroundColor = '#e3f2fd';
                            this.style.fontWeight = 'bold';
                        } else {
                            // Remove from selection
                            selectedTasks.splice(idx, 1);
                            this.style.backgroundColor = 'transparent';
                            this.style.fontWeight = 'normal';
                        }
                        
                        // sync for get_value
                        node._selectedTasks = selectedTasks.slice();
                        updateSelectedDisplay();
                    });
                    
                    option.addEventListener('mouseover', function() {
                        if (selectedTasks.indexOf(parseInt(this.dataset.taskId)) === -1) {
                            this.style.backgroundColor = '#f8f9fa';
                        }
                    });
                    
                    option.addEventListener('mouseout', function() {
                        if (selectedTasks.indexOf(parseInt(this.dataset.taskId)) === -1) {
                            this.style.backgroundColor = 'transparent';
                        }
                    });
                    
                    dropdownPanel.appendChild(option);
                    taskItems.push(option);
                });
            }
            
            // Open dropdown when search input is focused or clicked
            searchInput.addEventListener('focus', function() {
                dropdownPanel.style.display = 'block';
            });
            
            searchInput.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownPanel.style.display = 'block';
            });
            
            // Search functionality - filters as you type
            searchInput.addEventListener('input', function() {
                dropdownPanel.style.display = 'block'; // Open when typing
                var searchTerm = this.value.toLowerCase();
                taskItems.forEach(function(item) {
                    var taskText = item.dataset.taskText || '';
                    var taskAssignee = item.dataset.taskAssignee || '';
                    var matches = taskText.indexOf(searchTerm) !== -1 || taskAssignee.indexOf(searchTerm) !== -1;
                    item.style.display = matches ? '' : 'none';
                });
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!container.contains(e.target)) {
                    dropdownPanel.style.display = 'none';
                }
            });
            
            // Selected tasks display (badges)
            var selectedDisplay = document.createElement('div');
            selectedDisplay.style.cssText = 'margin-top: 8px;';
            
            function updateSelectedDisplay() {
                selectedDisplay.innerHTML = '';
                // ensure current selection is available to get_value
                node._selectedTasks = selectedTasks.slice();
                
                // Find the parent row and lightbox for height adjustment
                var parentRow = node.closest('.gantt_cal_light_wide');
                
                if (selectedTasks.length === 0) {
                    selectedDisplay.style.display = 'none';
                    // Reset to normal height
                    if (parentRow) {
                        parentRow.style.height = 'auto';
                    }
                    node.style.height = '32px';
                } else {
                    selectedDisplay.style.display = 'block';
                    // Calculate needed height for badges
                    var badgeRows = Math.ceil(selectedTasks.length / 3);
                    var neededHeight = 32 + 8 + (badgeRows * 28); // input + gap + badges
                    
                    node.style.height = neededHeight + 'px';
                    if (parentRow) {
                        parentRow.style.height = 'auto';
                    }
                    
                    selectedTasks.forEach(function(taskId) {
                        var t = taskMap[taskId];
                        if (!t) return;
                        
                        var badge = document.createElement('span');
                        badge.style.cssText = 'display: inline-block; background: #2196F3; color: white; padding: 4px 8px; margin: 2px; border-radius: 3px; font-size: 12px;';
                        badge.textContent = t.text;
                        
                        var removeBtn = document.createElement('span');
                        removeBtn.textContent = ' ×';
                        removeBtn.style.cssText = 'margin-left: 4px; cursor: pointer; font-weight: bold;';
                        removeBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            var idx = selectedTasks.indexOf(taskId);
                            if (idx !== -1) {
                                selectedTasks.splice(idx, 1);
                                // sync for get_value
                                node._selectedTasks = selectedTasks.slice();
                                updateSelectedDisplay();
                                // Update option styling
                                taskItems.forEach(function(item) {
                                    if (parseInt(item.dataset.taskId) === taskId) {
                                        item.style.backgroundColor = 'transparent';
                                        item.style.fontWeight = 'normal';
                                    }
                                });
                            }
                        });
                        
                        badge.appendChild(removeBtn);
                        selectedDisplay.appendChild(badge);
                    });
                }
            }
            
            container.appendChild(searchInput);
            container.appendChild(dropdownPanel);
            container.appendChild(selectedDisplay);
            
            node.appendChild(container);
            
            // Initialize selected display
            updateSelectedDisplay();
            
            return;
        }
        
        // Handle Kanboard link button
        var taskId = task.id;
        
        // Build the Kanboard task view URL
        var taskUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*\/[^\/]*$/, '') + 
                      '?controller=TaskViewController&action=show&task_id=' + taskId + '&project_id=' + projectId;
        
        // Create button element using DOM (CSP-compliant - no inline onclick)
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'gantt_btn_set gantt_view_kanboard_btn';
        button.style.cssText = 'margin: 5px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;';
        button.innerHTML = '<i class="fa fa-external-link"></i> View Task in Kanboard';
        
        // Attach event listener programmatically (CSP-compliant)
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.open(taskUrl, '_blank');
            return false;
        });
        
        // Clear node and append button
        node.innerHTML = '';
        node.appendChild(button);
    },
    get_value: function(node, task, section) {
        // Handle Tasks multi-select value retrieval
        if (section.name === 'tasks') {
            // Read the live selection stored by set_value
            var selected = node && Array.isArray(node._selectedTasks) ? node._selectedTasks : [];
            // ensure integers
            return selected.map(function(v){ return parseInt(v, 10); }).filter(function(v){ return !isNaN(v); });
        }
        return task[section.map_to];
    },
    focus: function(node) {
        // No focus needed for button
    }
};
    // new code for lightbox + link to kb


    
    // Initialize Gantt
    try {
        gantt.init("dhtmlx-gantt-chart");
        console.log('DHtmlX Gantt initialized successfully');
        
        // ✅ RESPONSIVE BEHAVIOR: Handle window resize
        var resizeTimeout;
        window.addEventListener('resize', function() {
            // Debounce resize events to avoid performance issues
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                console.log('Window resized, updating Gantt chart dimensions...');
                // Force DHTMLX to recalculate dimensions
                gantt.setSizes();
                gantt.render();
            }, 250);
        });
        
        // Initial sizing after initialization
        setTimeout(function() {
            gantt.setSizes();
        }, 100);
        
        // ✅ SETUP TOGGLE FOR MOVE DEPENDENCIES WITH TASK
        setupMoveDependenciesToggle();
        
        // ✅ SETUP TOGGLE FOR SHOW PROGRESS BARS
        setupShowProgressToggle();
        
        // ✅ MANUAL DEPENDENCY MOVEMENT (GPL version doesn't have auto-scheduling)
        setupManualDependencyMovement();
        
        return true;
    } catch (error) {
        console.error('Error initializing DHtmlX Gantt:', error);
        return false;
    }
}

// Global variable to track toggle state
var moveDependenciesEnabled = false;

/**
 * ✅ SETUP MOVE DEPENDENCIES TOGGLE
 * Controls whether dependencies move manually when tasks are dragged
 */
function setupMoveDependenciesToggle() {
    var toggleEl = document.getElementById('move-dependencies-toggle');
    if (!toggleEl) {
        console.warn('Move dependencies toggle not found');
        return;
    }
    
    // Restore saved preference from localStorage (default: OFF)
    var savedPref = localStorage.getItem('moveDependencies');
    if (savedPref !== null) {
        moveDependenciesEnabled = savedPref === 'true';
    } else {
        moveDependenciesEnabled = false; // Default: OFF
    }
    toggleEl.checked = moveDependenciesEnabled;
    
    // Handle toggle changes
    toggleEl.addEventListener('change', function(e) {
        moveDependenciesEnabled = e.target.checked;
        localStorage.setItem('moveDependencies', moveDependenciesEnabled);
        
        // Show feedback message
        if (typeof gantt.message === 'function') {
            gantt.message({
                text: moveDependenciesEnabled 
                    ? '✅ ON: Dependent tasks will move with this task' 
                    : '⏸️ OFF: Dependent tasks will stay in place',
                type: moveDependenciesEnabled ? 'info' : 'warning',
                expire: 3000
            });
        }
        
        console.log('🔄 Move dependencies toggled:', moveDependenciesEnabled);
    });
    
    console.log('✅ Move dependencies toggle initialized - Default: OFF, Current:', moveDependenciesEnabled);
}

/**
 * ✅ SETUP SHOW PROGRESS TOGGLE
 * Controls whether progress bars are visible on tasks
 */
function setupShowProgressToggle() {
    var toggleEl = document.getElementById('show-progress-toggle');
    if (!toggleEl) {
        console.warn('Show progress toggle not found');
        return;
    }
    
    // Restore saved preference from localStorage (default: ON)
    var savedPref = localStorage.getItem('showProgress');
    var showProgress = savedPref !== null ? savedPref === 'true' : true; // Default: ON
    toggleEl.checked = showProgress;
    
    // Apply initial state
    gantt.config.show_progress = showProgress;
    
    // Handle toggle changes
    toggleEl.addEventListener('change', function(e) {
        showProgress = e.target.checked;
        localStorage.setItem('showProgress', showProgress);
        gantt.config.show_progress = showProgress;
        
        // Re-render to apply changes
        gantt.render();
        
        // Show feedback message
        if (typeof gantt.message === 'function') {
            gantt.message({
                text: showProgress 
                    ? '✅ Progress bars shown' 
                    : '⏸️ Progress bars hidden',
                type: 'info',
                expire: 2000
            });
        }
        
        console.log('🔄 Show progress toggled:', showProgress);
    });
    
    console.log('✅ Show progress toggle initialized - Default: ON, Current:', showProgress);
}

/**
 * ✅ MANUAL DEPENDENCY MOVEMENT
 * Implements dependency movement for GPL version (auto-scheduling is PRO only)
 */
function setupManualDependencyMovement() {
    var taskOriginalDates = {};
    var isMovingDependencies = false; // Flag to prevent re-entrant calls
    
    // Store original dates before drag
    gantt.attachEvent("onBeforeTaskDrag", function(id, mode, e) {
        if (!moveDependenciesEnabled || isMovingDependencies) return true;
        
        var task = gantt.getTask(id);
        taskOriginalDates[id] = {
            start: new Date(task.start_date),
            end: new Date(task.end_date)
        };
        console.log('📍 Drag started for task:', id, task.text);
        return true;
    });
    
    // Move dependent tasks after drag completes
    gantt.attachEvent("onAfterTaskDrag", function(id, mode, e) {
        console.log('📍 Drag ended for task:', id, 'Mode:', mode, 'Toggle:', moveDependenciesEnabled, 'IsMoving:', isMovingDependencies);
        
        // Prevent re-entrant calls when we're already moving dependencies
        if (isMovingDependencies) {
            console.log('⚠️ Already moving dependencies, skipping');
            return;
        }
        
        if (!moveDependenciesEnabled || !taskOriginalDates[id]) {
            delete taskOriginalDates[id];
            return;
        }
        
        var task = gantt.getTask(id);
        var originalStart = taskOriginalDates[id].start;
        var newStart = task.start_date;
        
        // Calculate time difference
        var timeDiff = newStart - originalStart;
        
        if (timeDiff === 0) {
            console.log('⚪ No movement detected');
            delete taskOriginalDates[id];
            return;
        }
        
        console.log('🔄 Task moved by:', timeDiff, 'ms (', timeDiff / (1000 * 60 * 60 * 24), 'days)');
        
        // Set flag to prevent re-entrant calls
        isMovingDependencies = true;
        
        // Find all tasks that depend on this task (successors)
        var movedTasks = moveSuccessorTasks(id, timeDiff);
        
        // Clear flag
        isMovingDependencies = false;
        
        if (movedTasks.length > 0) {
            console.log('✅ Moved', movedTasks.length, 'dependent task(s):', movedTasks);
            gantt.message({
                text: '✅ Moved ' + movedTasks.length + ' dependent task(s)',
                type: 'info',
                expire: 2000
            });
        } else {
            console.log('⚪ No dependent tasks to move');
        }
        
        delete taskOriginalDates[id];
    });
    
    console.log('✅ Manual dependency movement initialized');
}

/**
 * Move all successor tasks (tasks that depend on this task)
 * @param {number} taskId - ID of the task that was moved
 * @param {number} timeDiff - Time difference in milliseconds
 * @returns {array} Array of moved task IDs
 */
function moveSuccessorTasks(taskId, timeDiff) {
    var movedTasks = [];
    var processed = {};
    var originalDates = {}; // Store original dates BEFORE any movement
    
    // First pass: Find all successors and store their original dates
    function findAllSuccessors(id) {
        if (processed[id]) return;
        processed[id] = true;
        
        var links = gantt.getLinks();
        var successors = links.filter(function(link) {
            return link.source == id;
        });
        
        successors.forEach(function(link) {
            var targetTask = gantt.getTask(link.target);
            
            // Store original dates if not already stored
            if (!originalDates[link.target]) {
                originalDates[link.target] = {
                    start: new Date(targetTask.start_date),
                    end: new Date(targetTask.end_date)
                };
            }
            
            // Recursively find successors
            findAllSuccessors(link.target);
        });
    }
    
    // Second pass: Move all successors using their stored original dates
    function moveAllSuccessors() {
        for (var taskId in originalDates) {
            var task = gantt.getTask(taskId);
            var original = originalDates[taskId];
            
            // Calculate new dates from ORIGINAL dates + offset
            var newStart = new Date(original.start.getTime() + timeDiff);
            var newEnd = new Date(original.end.getTime() + timeDiff);
            
            // Update the task silently
            task.start_date = newStart;
            task.end_date = newEnd;
            gantt.refreshTask(taskId);
            
            movedTasks.push(taskId);
            console.log('  ↳ Moved task:', taskId, task.text, 
                'from', original.start.toDateString(), 
                'to', newStart.toDateString(),
                '(' + (timeDiff / (1000 * 60 * 60 * 24)).toFixed(1) + ' days)');
        }
    }
    
    // Execute: find all, then move all
    findAllSuccessors(taskId);
    moveAllSuccessors();
    gantt.render();
    
    return movedTasks;
}

function loadGanttData(data) {
    console.log('Loading Gantt data...', data);
    
    if (data && data.data) {
        console.log('Using data.data format, tasks:', data.data.length);
        gantt.parse(data);
    } else if (Array.isArray(data)) {
        console.log('Using array format, tasks:', data.length);
        gantt.parse({data: data, links: []});
    } else {
        console.log('No valid data, creating empty gantt');
        gantt.parse({data: [], links: []});
    }
    gantt.eachTask(function (t) {
        if (t.parent === undefined || t.parent === null) {
            t.parent = 0;       // treat as top-level
        }
    });
    
    updateStatistics();
    // ✅ Auto-adjust parent durations after parsing data
    setTimeout(function() {
        recalcAllParentDurations();
    }, 100);
}


//new
// Simple zoom configuration
var currentZoomLevel = 1; // Start at day view
var zoomLevels = [
    { name: "hour", scales: [{unit: "day", format: "%d %M"}, {unit: "hour", format: "%H"}] },
    { name: "day", scales: [{unit: "week", format: "Week #%W"}, {unit: "day", format: "%d %M"}] },
    { name: "week", scales: [{unit: "month", format: "%F"}, {unit: "week", format: "W%W"}] },
    { name: "month", scales: [{unit: "year", format: "%Y"}, {unit: "month", format: "%M"}] }
];

function smartZoom(direction) {
    var newLevel = direction === 'in' ? 
        Math.max(0, currentZoomLevel - 1) : 
        Math.min(zoomLevels.length - 1, currentZoomLevel + 1);
    
    if (newLevel === currentZoomLevel) return;
    
    // Save center date to maintain position
    var scrollState = gantt.getScrollState();
    var centerDate = gantt.dateFromPos(scrollState.x + scrollState.width / 2);
    
    // Apply zoom
    gantt.config.scales = zoomLevels[newLevel].scales;
    gantt.render();
    currentZoomLevel = newLevel;
    
    // Restore center position
    if (centerDate) {
        var newPos = gantt.posFromDate(centerDate);
        gantt.scrollTo(newPos - scrollState.width / 2, scrollState.y);
    }
}

function smartFitToScreen() {
    var tasks = gantt.getTaskByTime();
    if (tasks.length === 0) {
        console.log('No tasks to fit');
        return;
    }
    
    // Find actual date range across all visible tasks
    var minDate = null, maxDate = null;
    tasks.forEach(function(task) {
        var start = task.start_date;
        var end = task.end_date || gantt.calculateEndDate(start, task.duration);
        if (!minDate || start < minDate) minDate = start;
        if (!maxDate || end > maxDate) maxDate = end;
    });
    
    if (!minDate || !maxDate) {
        console.log('Could not determine date range');
        return;
    }
    
    // Add padding (10% on each side)
    var diff = (maxDate - minDate) / 10;
    var paddedMinDate = new Date(minDate.getTime() - diff);
    var paddedMaxDate = new Date(maxDate.getTime() + diff);
    
    // Calculate best zoom level based on available space
    var container = document.getElementById('dhtmlx-gantt-chart');
    if (!container) return;
    
    var availableWidth = container.offsetWidth - (gantt.config.grid_width || 400);
    var totalDays = (paddedMaxDate - paddedMinDate) / (1000 * 60 * 60 * 24);
    var pixelsPerDay = availableWidth / totalDays;
    
    // Choose appropriate zoom level
    // hour: >100px/day, day: >30px/day, week: >10px/day, month: else
    var level;
    if (pixelsPerDay > 100) {
        level = 0; // Hour view
    } else if (pixelsPerDay > 30) {
        level = 1; // Day view
    } else if (pixelsPerDay > 10) {
        level = 2; // Week view
    } else {
        level = 3; // Month view
    }
    
    console.log('🎯 Fit to Screen:', {
        tasks: tasks.length,
        dateRange: totalDays.toFixed(1) + ' days',
        pixelsPerDay: pixelsPerDay.toFixed(2),
        zoomLevel: zoomLevels[level].name
    });
    
    // Apply zoom level
    gantt.config.scales = zoomLevels[level].scales;
    currentZoomLevel = level;
    gantt.render();
    
    // Scroll to show the first task (left edge)
    setTimeout(function() {
        gantt.showDate(minDate);
    }, 100);
    
    // Show success message
    if (typeof gantt.message === 'function') {
        gantt.message({
            text: '📐 Fit to screen: ' + zoomLevels[level].name + ' view',
            type: 'info',
            expire: 2000
        });
    }
}
//new

/**
 * ✅ ADJUST SPRINT DURATION based on child tasks
 * Only applies to sprints (task_type === 'sprint' or type === 'project')
 * Regular parent-child tasks do NOT auto-adjust
 */
function recalcParentDuration(childTask) {
    if (!childTask || !childTask.parent) return;

    var parentId = childTask.parent;
    var parent = gantt.getTask(parentId);
    if (!parent) return;
    
    // ✅ ONLY adjust duration for SPRINTS, not regular parent tasks
    var isSprint = parent.task_type === 'sprint' || parent.type === 'project';
    if (!isSprint) {
        console.log('⏭️ Skipping duration adjustment for non-sprint parent:', parent.text);
        return;
    }

    // Gather all direct children of the sprint
    var children = gantt.getChildren(parentId).map(function(id) {
        return gantt.getTask(id);
    });

    if (children.length === 0) return;

    // Compute earliest start and latest end among children
    var minStart = children[0].start_date;
    var maxEnd = children[0].end_date;
    for (var i = 1; i < children.length; i++) {
        var c = children[i];
        if (c.start_date < minStart) minStart = c.start_date;
        if (c.end_date > maxEnd) maxEnd = c.end_date;
    }

    // Update sprint start/end based on new bounds
    var changed = false;
    if (+minStart !== +parent.start_date) {
        parent.start_date = new Date(minStart);
        changed = true;
    }
    if (+maxEnd !== +parent.end_date) {
        parent.end_date = new Date(maxEnd);
        changed = true;
    }

    if (changed) {
        console.log('🧮 Sprint duration recalculated:', parent.text, {
            newStart: parent.start_date,
            newEnd: parent.end_date
        });
        gantt.refreshTask(parentId);
        gantt.updateTask(parentId);
    }
}

/**
 * ✅ RECALCULATE ALL SPRINT DURATIONS after data load
 * Only adjusts sprints, not regular parent tasks
 */
function recalcAllParentDurations() {
    console.log('🔄 Running initial sprint duration recalculation...');
    gantt.eachTask(function(task) {
        if (task.parent) {
            var parent = gantt.getTask(task.parent);
            // Only recalc if parent is a sprint
            if (parent && (parent.task_type === 'sprint' || parent.type === 'project')) {
                recalcParentDuration(task);
            }
        }
    });
    gantt.render();
    console.log('✅ Sprint durations synced after load');
}

function setupGanttEventHandlers() {
    // Bind once guard
    if (window.__ganttHandlersBound) {
        console.log('[Gantt] handlers already bound — skipping');
        return;
    }
    window.__ganttHandlersBound = true;

    // de-duped toast helper (global-ish)
    if (!window.singleToast) {
        let __lastToast = { text: "", at: 0 };
        window.singleToast = function(text) {
            const now = Date.now();
            if (text === __lastToast.text && now - __lastToast.at < 1000) return;
            __lastToast = { text, at: now };
            gantt.message({ type: "warning", text, expire: 1500 });
        };
    }
    // Data processor for CRUD operations - URLs will be set by template
    if (typeof window.ganttUrls !== 'undefined' && window.ganttUrls.update) {
        console.log('Setting up data processor with URLs:', window.ganttUrls);
        
        // Use simplified event-based approach instead of data processor
        // ---- same-level rule helpers ----
    function _parentOf(task){
        return (task && task.parent != null && task.parent !== undefined) ? task.parent : 0;
    }
    function _sameLevelAllowed(a, b){
        const pa = _parentOf(a);
        const pb = _parentOf(b);
        // allowed: both top-level OR both children of the same parent
        return (pa === 0 && pb === 0) || (pa !== 0 && pa === pb);
    }
    
    // dhtmlx built-in validator (runs before adding the link)
    gantt.attachEvent("onLinkValidation", function(link){
        const s = gantt.getTask(link.source);
        const t = gantt.getTask(link.target);
        const ok = _sameLevelAllowed(s, t);
        if (!ok) singleToast("Rule: only siblings or top-level tasks can be linked.");
        return ok;
      });
    
        // Handle task creation
        gantt.attachEvent("onAfterTaskAdd", function(id, task) {
            console.log('New task created, sending to server:', id, task);
            
            // Apply green color if milestone
            if (task.is_milestone) {
                task.color = "#27ae60";
            }
            
            // Update statistics
            updateStatistics();
            
            // ✅ Check if this is a subtask (has a parent)
            var parentTaskId = task.parent;
            var isSubtask = parentTaskId && parentTaskId !== 0 && parentTaskId !== '0';
            
            if (isSubtask) {
                console.log('🔗 Creating subtask with parent:', parentTaskId);
            }
            
            // Send create request to server including all fields
            // ✅ Format dates as strings to preserve exact time
            var formattedStartDate = gantt.date.date_to_str(gantt.config.date_format)(task.start_date);
            var formattedEndDate = gantt.date.date_to_str(gantt.config.date_format)(task.end_date);
            
            console.log('Creating task with times:', formattedStartDate, '→', formattedEndDate);
            
            fetch(window.ganttUrls.create, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: task.text,
                    start_date: formattedStartDate,
                    end_date: formattedEndDate,
                    priority: task.priority || 'normal',
                    owner_id: task.owner_id || 0,
                    task_type: task.task_type || 'task',
                    child_tasks: task.child_tasks || [],
                    is_milestone: task.is_milestone ? 1 : 0
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server response for new task:', data);
                if (data.result === 'ok' && data.id) {
                    // Update the task ID in Gantt with the server-assigned ID
                    gantt.changeTaskId(id, data.id);
                    console.log('Task ID updated from', id, 'to', data.id);
                    
                    // ✅ If this is a subtask, create the internal link "is a child of"
                    if (isSubtask) {
                        console.log('🔗 Creating internal link: Task', data.id, 'is a child of', parentTaskId);
                        
                        fetch(window.ganttUrls.createLink, {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                source: data.id,     // Child task (the new subtask)
                                target: parentTaskId, // Parent task
                                type: 'child'        // 'child' = "is a child of" in Kanboard
                            })
                        })
                        .then(response => response.json())
                        .then(linkData => {
                            console.log('✅ Internal link created successfully:', linkData);
                            if (linkData.result !== 'ok') {
                                console.error('Failed to create internal link:', linkData.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error creating internal link:', error);
                        });
                    }
                } else {
                    console.error('Failed to create task:', data.message);
                }
            })
            .catch(error => {
                console.error('Error creating task:', error);
            });
        });
        
        // ✅ Track tasks that need to be saved after auto-scheduling completes
        var tasksToSave = {};
        var saveTimeout = null;
        
        gantt.attachEvent("onAfterTaskUpdate", function(id, task) {
            console.log('Task updated:', id, task.text);
        
            // If this is a parent task, do NOT allow it to be shorter than its children.
            var childIds = gantt.getChildren(id);
            if (childIds && childIds.length > 0) {
                var minChildStart = null;
                var maxChildEnd = null;
        
                childIds.forEach(function(cid) {
                    var c = gantt.getTask(cid);
                    if (!minChildStart || c.start_date < minChildStart) minChildStart = c.start_date;
                    var cEnd = c.end_date || gantt.calculateEndDate(c.start_date, c.duration);
                    if (!maxChildEnd || cEnd > maxChildEnd) maxChildEnd = cEnd;
                });
        
                // Detect invalid shrink: parent starts after earliest child OR ends before latest child
                var invalid =
                    (minChildStart && task.start_date > minChildStart) ||
                    (maxChildEnd   && task.end_date   < maxChildEnd);
        
                if (invalid) {
                    // Toast + revert visually to span children; DO NOT save to backend
                    if (window.singleToast) {
                        window.singleToast("Parent cannot be shorter than its child tasks.");
                    } else if (gantt.message) {
                        gantt.message({ type: "warning", text: "Parent cannot be shorter than its child tasks.", expire: 1500 });
                    }
        
                    // Snap parent back to fully cover children
                    if (minChildStart) task.start_date = new Date(minChildStart);
                    if (maxChildEnd)   task.end_date   = new Date(maxChildEnd);
                    task.duration = gantt.calculateDuration(task.start_date, task.end_date);
        
                    gantt.refreshTask(id);
                    // IMPORTANT: skip enqueueing save for this task
                    return true; // exit handler early
                }
            }
        
            // Keep your milestone color tweak
            if (task.is_milestone) {
                task.color = "#27ae60";
                gantt.refreshTask(id);
            }
        
            // If this task has a parent, recalc that parent’s span (unchanged behavior)
            if (task.parent) {
                console.log('Refreshing parent after child update:', task.parent);
                recalcParentDuration(task);
                gantt.refreshTask(task.parent, true);
            }
        
            // Queue save to backend (unchanged)
            tasksToSave[id] = {
                id: id,
                text: task.text,
                start_date: gantt.date.date_to_str(gantt.config.date_format)(task.start_date),
                end_date:   gantt.date.date_to_str(gantt.config.date_format)(task.end_date),
                priority: task.priority,
                owner_id: task.owner_id || 0,
                task_type: task.task_type || 'task',
                child_tasks: task.child_tasks || [],
                is_milestone: task.is_milestone ? 1 : 0,
                progress: task.progress || 0  // ✅ Save progress value
            };
        
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(function() {
                saveQueuedTasks();
            }, 500);
        });
        

        
        // Save all queued tasks at once
        function saveQueuedTasks() {
            if (Object.keys(tasksToSave).length === 0) return;
            
            console.log('Saving queued tasks:', Object.keys(tasksToSave));
            
            // Save each task
            for (var taskId in tasksToSave) {
                var taskData = tasksToSave[taskId];
                
                fetch(window.ganttUrls.update, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(taskData)
                })
                .then(response => response.json())
                .then(data => {
                if (data.result !== 'ok') {
                    console.error('Failed to save task:', data.message);
                }
            })
            .catch(error => {
                console.error('Error saving task:', error);
                });
            }
            
            // Clear the queue
            tasksToSave = {};
        }
        
        // Handle task deletion
        gantt.attachEvent("onBeforeTaskDelete", function(id, task) {
            console.log('Task deletion requested, sending to server:', id, task);
            
            // Send delete request to server
            fetch(window.ganttUrls.remove, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Task deletion response:', data);
                if (data.result !== 'ok') {
                    console.error('Failed to delete task:', data.message);
                }
            })
            .catch(error => {
                console.error('Error deleting task:', error);
            });
            
            // Return true to allow the deletion in the UI
            return true;
        });
        
        // Prevent infinite loops
        var isProcessingLink = false;
        
        // Handle dependency creation when user draws arrows in Gantt
        gantt.attachEvent("onAfterLinkAdd", function(id, link) {
            
            // Prevent infinite loop
            if (isProcessingLink) {
                console.log('Skipping link creation - already processing');
                return;
            }
            isProcessingLink = true;
            console.log('Link created, sending to server:', id, link);
            console.log('Using URL:', window.ganttUrls.createLink);
            
            // Send dependency to server using fetch API
            fetch(window.ganttUrls.createLink, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    source: link.source,
                    target: link.target,
                    type: link.type
                })
            })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                return response.text(); // Get as text first to see what we're getting
            })
            .then(text => {
                console.log('Raw response:', text);
                try {
                    const data = JSON.parse(text);
                    console.log('Dependency creation response:', data);
                    if (data.result !== 'ok') {
                        console.error('Failed to create dependency:', data.message);
                        // ⚠️ FIX: Remove link WITHOUT triggering events to prevent infinite loop
                        gantt.silent(function() {
                            gantt.deleteLink(id);
                        });
                        isProcessingLink = false; // Reset flag
                        return;
                    }
                    // ✅ SUCCESS: Reload fresh data from server to reflect changes
                    console.log('Dependency created successfully - reloading fresh data from server...');
                    reloadGanttDataFromServer();
                    isProcessingLink = false; // Reset flag
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    console.error('Response was not valid JSON:', text);
                    // Remove the link WITHOUT triggering events
                    gantt.silent(function() {
                        gantt.deleteLink(id);
                    });
                    isProcessingLink = false; // Reset flag
                }
            })
            .catch(error => {
                console.error('Error creating dependency:', error);
                // Remove the link WITHOUT triggering events
                gantt.silent(function() {
                    gantt.deleteLink(id);
                });
                isProcessingLink = false; // Reset flag
            });
        });

        // Handle dependency removal when user deletes arrows in Gantt  
        gantt.attachEvent("onAfterLinkDelete", function(id, link) {
            
            // Prevent processing during link creation cleanup
            if (isProcessingLink) {
                console.log('Skipping removal - link creation is being processed');
                return;
            }
            
            console.log('Link deleted, sending to server:');
            console.log('  DHTMLX ID:', id);
            console.log('  Link object:', link);
            
            // Use the actual database ID from the link object, not the DHTMLX internal ID
            var databaseId = link.id || id;
            console.log('  Using database link ID:', databaseId, '(type:', typeof databaseId, ')');
            
            // Ensure we have a valid integer ID for the database
            var linkIdForServer = parseInt(databaseId, 10);
            
            // Check if this looks like a DHTMLX internal ID (very large number)
            if (isNaN(linkIdForServer) || linkIdForServer <= 0 || linkIdForServer > 1000000) {
                console.log('Invalid or internal DHTMLX ID - skipping server request:', databaseId);
                return; // Don't send request for internal IDs or invalid IDs
            }
            
            console.log('  Sending link ID to server:', linkIdForServer);
            
            // Send removal request to server using fetch API
            fetch(window.ganttUrls.removeLink, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    id: linkIdForServer,
                    source: link.source,
                    target: link.target
                })
            })
            .then(response => {
                console.log('Removal response status:', response.status);
                return response.text(); // Get as text first to handle both JSON and HTML responses
            })
            .then(text => {
                console.log('Raw removal response:', text);
                try {
                    const data = JSON.parse(text);
                    console.log('Dependency removal response:', data);
                    if (data.result === 'ok') {
                        console.log('Dependency removed successfully from server');
                        
                        // ⚠️ FORCE REMOVAL: Sometimes DHTMLX doesn't remove the visual arrow properly
                        // So we need to force remove it and refresh the chart
                        console.log('Force removing link from UI and refreshing...');
                        
                        // Try to remove the link from DHTMLX if it still exists
                        if (gantt.isLinkExists(linkIdForServer)) {
                            console.log('Link still exists in DHTMLX, force removing...');
                            gantt.deleteLink(linkIdForServer);
                        }
                        
                        // ✅ DYNAMIC SOLUTION: Reload fresh data from server
                        console.log('Dependency removed successfully - reloading fresh data from server...');
                        reloadGanttDataFromServer();
                        
                        return; // Exit early
                    } else {
                        console.error('Failed to remove dependency:', data.message);
                        // ⚠️ FIX: Don't restore link - let the UI removal stand
                        // The link probably didn't exist in database anyway
                        console.log('Server removal failed - keeping UI removal (link may not have existed in DB)');
                        return;
                    }
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    console.error('Response was not valid JSON:', text);
                    
                    // ⚠️ FIX: Don't restore link on parse errors either  
                    // Most parse errors happen because the link wasn't in the database
                    console.log('Parse error during removal - keeping UI removal (link likely not in DB)');
                    return; // Exit early, don't refresh
                }
            })
            .catch(error => {
                console.error('Error removing dependency:', error);
                // ⚠️ FIX: Don't restore on network errors either
                console.log('Network error during removal - keeping UI removal');
            });
        });
        
        console.log('Event-based data handling initialized successfully');
        
    } else {
        console.warn('No ganttUrls found, data processor not initialized');
    }
    
    // Note: recalcParentDuration and recalcAllParentDurations moved to global scope



/**
 * ✅ DYNAMIC DATA RELOAD FUNCTION
 * Reloads fresh data from server to ensure chart is always in sync
 */
function reloadGanttDataFromServer() {
    console.log('Reloading Gantt data from server...');
    
    // Get current page URL to reload data from same source
    var currentUrl = window.location.href;
    
    // Make request to current page to get fresh data
    fetch(currentUrl, {
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Cache-Control': 'no-cache'
        }
    })
    .then(response => response.text())
    .then(html => {
        console.log('Received fresh HTML, extracting task data...');
        
        // Extract the fresh taskData from the HTML response
        var taskDataMatch = html.match(/window\.taskData\s*=\s*({[^;]+});/);
        if (taskDataMatch) {
            try {
                var freshTaskData = JSON.parse(taskDataMatch[1]);
                console.log('Extracted fresh task data:', freshTaskData);
                
                // Update cached data
                window.taskData = freshTaskData;
                
                // Clear and reload chart with fresh data
                gantt.clearAll();
                gantt.parse(freshTaskData);
                
                console.log('✅ Chart reloaded with fresh server data!');
                
            } catch (parseError) {
                console.error('Failed to parse fresh task data:', parseError);
                fallbackRefresh();
            }
        } else {
            console.warn('Could not extract task data from server response');
            fallbackRefresh();
        }
    })
    .catch(error => {
        console.error('Failed to reload data from server:', error);
        fallbackRefresh();
    });
}

/**
 * Fallback refresh method when server reload fails
 */
function fallbackRefresh() {
    console.log('Using fallback refresh - reloading page...');
    // As last resort, reload the entire page to get fresh data
    window.location.reload();
    }
    
    // Toolbar event handlers
    var addTaskBtn = document.getElementById('dhtmlx-add-task');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            gantt.createTask();
        });
    }
    
    // var zoomInBtn = document.getElementById('dhtmlx-zoom-in');
    // if (zoomInBtn) {
    //     zoomInBtn.addEventListener('click', function() {
    //         if (gantt.ext && gantt.ext.zoom) {
    //             gantt.ext.zoom.zoomIn();
    //         }
    //     });
    // }
    
    // var zoomOutBtn = document.getElementById('dhtmlx-zoom-out');
    // if (zoomOutBtn) {
    //     zoomOutBtn.addEventListener('click', function() {
    //         if (gantt.ext && gantt.ext.zoom) {
    //             gantt.ext.zoom.zoomOut();
    //         }
    //     });
    // }
    
    // var fitBtn = document.getElementById('dhtmlx-fit');
    // if (fitBtn) {
    //     fitBtn.addEventListener('click', function() {
    //         if (gantt.ext && gantt.ext.zoom) {
    //             gantt.ext.zoom.setLevel("month");
    //         }
    //     });
    // }


    // Enhanced zoom handlers
    var zoomInBtn = document.getElementById('dhtmlx-zoom-in');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
        smartZoom('in');
        });
    }
    
    var zoomOutBtn = document.getElementById('dhtmlx-zoom-out');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            smartZoom('out');
        });
    }

// ✅ GROUP BY DROPDOWN - Manual grouping (GPL version doesn't have gantt.groupBy())
var groupBySelect = document.getElementById('dhtmlx-group-by-select');
var originalTasksData = null;
var currentGroupMode = 'none';

if (groupBySelect) {
    console.log('✅ Group-by dropdown found, attaching listener');
    
    groupBySelect.addEventListener('change', function() {
        var mode = this.value;
        console.log('🔄 Group by changed to:', mode);
        
        if (mode === 'none') {
            // Clear grouping - restore original data
            clearManualGrouping();
        } else if (mode === 'sprint') {
            applySprintOnlyView();
        } else {
            // Apply manual grouping
            applyManualGrouping(mode);
        }
    });
} else {
    console.warn('⚠️ Group-by dropdown NOT found (#dhtmlx-group-by-select)');
}

function clearManualGrouping() {
    console.log('🔄 Clearing grouping...');
    
    if (originalTasksData) {
        gantt.clearAll();
        gantt.parse(originalTasksData);
        currentGroupMode = 'none';
        console.log('✅ Grouping cleared, restored original data');
    } else {
        console.log('⚠️ No original data to restore');
    }
}

function applyManualGrouping(mode) {
    console.log('🔄 Applying grouping by:', mode);
    
    // Explain what each mode does
    if (mode === 'assignee') {
        console.log('   → Groups tasks by who they are assigned to (username)');
    } else if (mode === 'group') {
        console.log('   → Groups tasks by the Kanboard User Group of the assignee (e.g., Frontend, Backend, Administrators)');
    }
    
    // Store original data if not already stored
    if (!originalTasksData || currentGroupMode === 'none') {
        originalTasksData = gantt.serialize();
        console.log('💾 Stored original task data:', originalTasksData.data.length, 'tasks');
    }
    
    currentGroupMode = mode;
    
    var tasks = gantt.getTaskByTime();
    console.log('📋 Total tasks to group:', tasks.length);
    
    var groups = {};
    var groupedData = [];
    var groupIdCounter = 100000; // High number to avoid ID conflicts
    
    var defaultLabel = mode === 'assignee' ? 'Unassigned' : 
                      mode === 'group' ? 'Ungrouped' : 
                      'No Sprint';
    
    // First pass: collect groups
    var sampleShown = false;
    tasks.forEach(function(task) {
        // Skip internal group/project tasks created by previous grouping
        if (task.type === 'project' && task.id >= 100000) {
            return;
        }
        
        // Show sample task data once for debugging
        if (!sampleShown) {
            console.log('📄 Sample task data:', {
                id: task.id,
                text: task.text,
                assignee: task.assignee,
                group: task.group,
                sprint: task.sprint,
                start_date: task.start_date
            });
            sampleShown = true;
        }
        
        var groupKey = task[mode] || defaultLabel;
        
        if (!groups[groupKey]) {
            groups[groupKey] = {
                id: groupIdCounter++,
                text: '📁 ' + groupKey,
                start_date: task.start_date,
                duration: 0,
                parent: 0,
                type: 'project',
                open: true,
                readonly: true,
                tasks: []
            };
        }
        
        groups[groupKey].tasks.push(task);
        
        // Update group start/end dates
        if (new Date(task.start_date) < new Date(groups[groupKey].start_date)) {
            groups[groupKey].start_date = task.start_date;
        }
    });
    
    // ✅ Sort tasks within each group by start_date (earliest first)
    for (var groupKey in groups) {
        groups[groupKey].tasks.sort(function(a, b) {
            return new Date(a.start_date) - new Date(b.start_date);
        });
    }
    
    // Second pass: build grouped data structure
    for (var groupKey in groups) {
        var group = groups[groupKey];
        groupedData.push({
            id: group.id,
            text: group.text,
            start_date: group.start_date,
            duration: group.duration,
            parent: 0,
            type: 'project',
            open: true,
            readonly: true
        });
        
        // Add all tasks under this group
        group.tasks.forEach(function(task) {
            groupedData.push({
                id: task.id,
                text: task.text,
                start_date: task.start_date,
                end_date: task.end_date,
                duration: task.duration,
                progress: task.progress,
                priority: task.priority,
                color: task.color,
                parent: group.id, // Set parent to group
                assignee: task.assignee,
                group: task.group,
                sprint: task.sprint,
                owner_id: task.owner_id,
                is_milestone: task.is_milestone,
                type: 'task',
                open: true
            });
        });
    }
    
    console.log('📊 Created', Object.keys(groups).length, 'groups with', tasks.length, 'tasks');
    
    // Clear and reload with grouped data
    gantt.clearAll();
    gantt.parse({data: groupedData, links: originalTasksData.links || []});
    
    console.log('✅ Grouping applied successfully');
}

/**
 * Show only Sprints and their direct children (using existing parent relations)
 */
function applySprintOnlyView() {
    console.log('🔄 Applying Sprint-only view (sprints + direct children)');
    if (!originalTasksData || currentGroupMode === 'none') {
        originalTasksData = gantt.serialize();
        console.log('💾 Stored original task data:', originalTasksData.data.length, 'tasks');
    }
    currentGroupMode = 'sprint';
    
    var tasks = gantt.getTaskByTime();
    var idToTask = {};
    tasks.forEach(function(t){ idToTask[t.id] = t; });
    
    var data = [];
    var include = {};
    
    // First: include all sprint tasks
    tasks.forEach(function(t){
        if (t.task_type === 'sprint' || t.type === 'project') {
            include[t.id] = true;
            // keep sprint bars as-is
            data.push({
                id: t.id,
                text: t.text,
                start_date: t.start_date,
                end_date: t.end_date,
                duration: t.duration,
                progress: t.progress,
                priority: t.priority,
                color: t.color,
                owner_id: t.owner_id,
                assignee: t.assignee,
                group: t.group,
                sprint: t.sprint,
                is_milestone: t.is_milestone,
                type: 'project',
                parent: 0,
                open: true
            });
        }
    });
    
    // Second: attach direct children under each sprint
    tasks.forEach(function(t){
        if (t.parent && include[t.parent]) {
            include[t.id] = true;
            data.push({
                id: t.id,
                text: t.text,
                start_date: t.start_date,
                end_date: t.end_date,
                duration: t.duration,
                progress: t.progress,
                priority: t.priority,
                color: t.color,
                owner_id: t.owner_id,
                assignee: t.assignee,
                group: t.group,
                sprint: t.sprint,
                is_milestone: t.is_milestone,
                type: 'task',
                parent: t.parent,
                open: true
            });
        }
    });
    
    // Filter links to included tasks only
    var links = (gantt.getLinks() || []).filter(function(l){
        return include[l.source] && include[l.target];
    });
    
    // Reload chart
    gantt.clearAll();
    gantt.parse({ data: data, links: links });
    console.log('✅ Sprint-only view applied:', data.length, 'tasks');
}

/**
 * ❌ SPRINT GROUPING - REMOVED (Default mode already shows parent-child structure)
 * Kanboard's internal links naturally create parent-child hierarchy,
 * so sprint grouping is redundant with the default view.
 */
/*
function applySprintGrouping() {
    console.log('🎯 Applying sprint-based grouping using Kanboard internal links...');
    
    var allTasks = gantt.getTaskByTime();
    var allLinks = originalTasksData.links || gantt.getLinks() || [];
    var groupedData = [];
    var groupIdCounter = 100000;
    var processedTasks = {};
    
    console.log('📊 Found', allLinks.length, 'total links');
    
    // Build parent-child map from links
    // Kanboard link types (need to identify "is a child of" and "is a parent of")
    var childToParent = {}; // child_id -> parent_id
    var parentToChildren = {}; // parent_id -> [child_ids]
    var linkTypeCount = {};
    
    // First pass: analyze all link types
    allLinks.forEach(function(link) {
        var linkType = link.type || 'unknown';
        linkTypeCount[linkType] = (linkTypeCount[linkType] || 0) + 1;
    });
    
    console.log('📊 Link types found:', linkTypeCount);
    
    // Second pass: process parent-child links only
    allLinks.forEach(function(link) {
        var sourceId = parseInt(link.source);
        var targetId = parseInt(link.target);
        var linkType = link.type;
        
        console.log('  🔗 Link:', sourceId, '→', targetId, 'type:', linkType);
        
        // Kanboard link relationships:
        // "is a child of": source (child) → target (parent)
        // "is a parent of": source (parent) → target (child)
        
        // We need to identify which type value corresponds to these
        // Let's handle both directions and log them
        
        // For "is a child of": source is child, target is parent
        if (!parentToChildren[targetId]) {
            parentToChildren[targetId] = [];
        }
        if (!parentToChildren[targetId].includes(sourceId)) {
            parentToChildren[targetId].push(sourceId);
        }
        childToParent[sourceId] = targetId;
        
        console.log('    → Treating as: Task', sourceId, 'is child of Task', targetId);
    });
    
    console.log('📋 Parent tasks (blocks others):', Object.keys(parentToChildren).length);
    console.log('📋 Child tasks (blocked by others):', Object.keys(childToParent).length);
    
    // Helper: Check if task has children via links
    function hasChildren(taskId) {
        return parentToChildren[taskId] && parentToChildren[taskId].length > 0;
    }
    
    // Helper: Get all children of a task via links
    function getChildren(taskId) {
        var childIds = parentToChildren[taskId] || [];
        return allTasks.filter(function(t) {
            return childIds.indexOf(parseInt(t.id)) !== -1;
        }).sort(function(a, b) {
            return new Date(a.start_date) - new Date(b.start_date);
        });
    }
    
    // Helper: Check if task is a child
    function isChildTask(taskId) {
        return childToParent[taskId] !== undefined;
    }
    
    console.log('📊 Analyzing task structure...');
    var parentCount = 0;
    var standaloneCount = 0;
    var childCount = 0;
    
    // Process all tasks
    allTasks.forEach(function(task) {
        // Skip if already processed (e.g., as a child)
        if (processedTasks[task.id]) return;
        
        // Skip internal group tasks from previous grouping
        if (task.type === 'project' && task.id >= 100000) return;
        
        var taskId = parseInt(task.id);
        var isChild = isChildTask(taskId);
        var isParent = hasChildren(taskId);
        
        if (isChild) {
            // Skip child tasks - they'll be processed with their parent
            childCount++;
            return;
        }
        
        if (isParent) {
            // Parent task: Create sprint group
            parentCount++;
            var sprintGroupId = groupIdCounter++;
            
            // Add sprint header (parent task as group)
            groupedData.push({
                id: sprintGroupId,
                text: '🎯 ' + task.text,
                start_date: task.start_date,
                duration: 0,
                parent: 0,
                type: 'project',
                open: true,
                readonly: true
            });
            
            processedTasks[task.id] = true;
            
            // Add all children under this sprint
            var children = getChildren(taskId);
            children.forEach(function(child) {
                groupedData.push({
                    id: child.id,
                    text: child.text,
                    start_date: child.start_date,
                    end_date: child.end_date,
                    duration: child.duration,
                    progress: child.progress,
                    priority: child.priority,
                    color: child.color,
                    parent: sprintGroupId,
                    assignee: child.assignee,
                    group: child.group,
                    sprint: child.sprint,
                    owner_id: child.owner_id,
                    is_milestone: child.is_milestone,
                    type: 'task',
                    open: true
                });
                processedTasks[child.id] = true;
            });
            
            console.log('  📁 Sprint:', task.text, '(' + children.length + ' tasks)');
            
        } else {
            // Standalone task: Just add the task itself (no sprint header)
            standaloneCount++;
            
            groupedData.push({
                id: task.id,
                text: task.text,
                start_date: task.start_date,
                end_date: task.end_date,
                duration: task.duration,
                progress: task.progress,
                priority: task.priority,
                color: task.color,
                parent: 0,  // Top-level
                assignee: task.assignee,
                group: task.group,
                sprint: task.sprint,
                owner_id: task.owner_id,
                is_milestone: task.is_milestone,
                type: 'task',
                open: true
            });
            
            processedTasks[task.id] = true;
            console.log('  📌 Standalone task:', task.text);
        }
    });
    
    console.log('📊 Sprint Summary:');
    console.log('   • Parent sprints (with children):', parentCount);
    console.log('   • Standalone sprints:', standaloneCount);
    console.log('   • Total child tasks:', childCount);
    console.log('   • Total sprint groups:', parentCount + standaloneCount);
    
    // Clear and reload with sprint-grouped data
    gantt.clearAll();
    gantt.parse({data: groupedData, links: originalTasksData.links || []});
    
    console.log('✅ Sprint grouping applied successfully');
}
*/

    
    // ✅ Expand/Collapse toggle button
    var expandToggleBtn = document.getElementById('dhtmlx-expand-toggle');
    if (expandToggleBtn) {
        expandToggleBtn.addEventListener('click', function() {
            var currentState = this.getAttribute('data-state');
            var icon = this.querySelector('i');
            
            if (currentState === 'collapsed') {
                // Expand all tasks
                gantt.eachTask(function(task) {
                    task.$open = true;
                });
                gantt.render();
                
                // Update button to show "Collapse All"
                this.setAttribute('data-state', 'expanded');
                this.setAttribute('title', 'Collapse All');
                icon.className = 'fa fa-compress';
                
                console.log('🔽 Expanded all tasks');
            } else {
                // Collapse all tasks
                gantt.eachTask(function(task) {
                    task.$open = false;
                });
                gantt.render();
                
                // Update button to show "Expand All"
                this.setAttribute('data-state', 'collapsed');
                this.setAttribute('title', 'Expand All');
                icon.className = 'fa fa-expand';
                
                console.log('🔼 Collapsed all tasks');
            }
        });
    }
    
    // View mode buttons - add delay to ensure DOM is ready
    setTimeout(function() {
        const viewButtons = document.querySelectorAll('.btn-dhtmlx-view');
        console.log('Found view buttons:', viewButtons.length);
        
        viewButtons.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const view = this.getAttribute('data-view');
                console.log('View mode button clicked:', view);
                
                // Remove active class from all buttons
                document.querySelectorAll('.btn-dhtmlx-view').forEach(function(b) {
                    b.classList.remove('active');
                });
                // Add active class to clicked button
                this.classList.add('active');
                
                // Change view mode
                changeViewMode(view);
            });
        });
    }, 100);
    
    // Update statistics when tasks change
    gantt.attachEvent("onAfterTaskUpdate", function(id, task) {
        console.log('Task statistics update for:', id, task);
        updateStatistics();
    });
    // Note: onAfterTaskAdd is now handled above to save to server, so we update stats there
    gantt.attachEvent("onAfterTaskDelete", function(id, task) {
        updateStatistics();
    });


}

function changeViewMode(mode) {
    console.log('Changing view mode to:', mode);
    // Use NEW scale configuration format
    switch(mode) {
        case 'Quarter Day':
            gantt.config.scales = [
                {unit: "hour", step: 1, format: "%H"},
                {unit: "minute", step: 15, format: "%i"}
            ];
            break;
        case 'Half Day':
            gantt.config.scales = [
                {unit: "hour", step: 1, format: "%H"},
                {unit: "minute", step: 30, format: "%i"}
            ];
            break;
        case 'Day':
            gantt.config.scales = [
                {unit: "day", step: 1, format: "%d %M"},
                {unit: "hour", step: 1, format: "%H"}
            ];
            break;
        case 'Week':
            gantt.config.scales = [
                {unit: "week", step: 1, format: "Week #%W"},
                {unit: "day", step: 1, format: "%d %M"}
            ];
            break;
        case 'Month':
            gantt.config.scales = [
                {unit: "month", step: 1, format: "%F %Y"},
                {unit: "day", step: 1, format: "%d"}
            ];
            break;
    }
    gantt.render();
    console.log('View mode changed to:', mode, 'Gantt re-rendered');
}



// ✅ OLD GROUPING FUNCTIONS (DEPRECATED - now using gantt.groupBy() API)
// These functions are kept for reference but no longer used

/*
var originalTasks = null; // Store original task data

function groupByAssignee() {
    console.log('Grouping by assignee...');
    
    // Store original tasks if not already stored
    if (!originalTasks) {
        originalTasks = gantt.serialize();
    }
    
    // Get all tasks
    var tasks = gantt.getTaskByTime();
    var groups = {};
    var groupedData = [];
    var groupIdCounter = 10000; // Start group IDs at a high number to avoid conflicts
    
    // Group tasks by assignee
    tasks.forEach(function(task) {
        var assignee = task.assignee || 'Unassigned';
        if (!groups[assignee]) {
            groups[assignee] = {
                id: groupIdCounter++,
                text: assignee,
                start_date: task.start_date,
                duration: 0,
                progress: 0,
                type: 'project', // Make it a project/group
                open: true,
                assignee: assignee,
                tasks: []
            };
        }
        groups[assignee].tasks.push(task);
    });
    
    // Build grouped structure
    for (var assignee in groups) {
        var group = groups[assignee];
        var minDate = null;
        var maxDate = null;
        var totalProgress = 0;
        
        // Calculate group properties
        group.tasks.forEach(function(task) {
            if (!minDate || task.start_date < minDate) {
                minDate = task.start_date;
            }
            var taskEnd = task.end_date || gantt.calculateEndDate(task.start_date, task.duration);
            if (!maxDate || taskEnd > maxDate) {
                maxDate = taskEnd;
            }
            totalProgress += task.progress;
        });
        
        group.start_date = minDate;
        group.end_date = maxDate;
        group.duration = gantt.calculateDuration(minDate, maxDate);
        group.progress = totalProgress / group.tasks.length;
        
        // Add group
        groupedData.push({
            id: group.id,
            text: group.text + ' (' + group.tasks.length + ' tasks)',
            start_date: gantt.date.date_to_str(gantt.config.date_format)(group.start_date),
            duration: group.duration,
            progress: group.progress,
            type: 'project',
            open: true
        });
        
        // Add tasks under group
        group.tasks.forEach(function(task) {
            groupedData.push({
                id: task.id,
                text: task.text,
                start_date: gantt.date.date_to_str(gantt.config.date_format)(task.start_date),
                end_date: gantt.date.date_to_str(gantt.config.date_format)(task.end_date || gantt.calculateEndDate(task.start_date, task.duration)),
                duration: task.duration,
                progress: task.progress,
                priority: task.priority,
                color: task.color,
                parent: group.id, // Set parent to group
                assignee: task.assignee
            });
        });
    }
    
    // Clear and reload with grouped data
    gantt.clearAll();
    gantt.parse({data: groupedData, links: []});
    
    console.log('Grouped by assignee successfully');
}

function clearGrouping() {
    console.log('Clearing grouping...');
    
    if (originalTasks) {
        gantt.clearAll();
        gantt.parse(originalTasks);
        originalTasks = null;
    }
    
    console.log('Grouping cleared');
}
*/

function updateStatistics() {
    var tasks = gantt.getTaskByTime();
    var completed = 0;
    var inProgress = 0;
    
    tasks.forEach(function(task) {
        if (task.progress >= 1) {
            completed++;
        } else if (task.progress > 0) {
            inProgress++;
        }
    });
    
    var completedElement = document.getElementById('dhtmlx-completed-count');
    var progressElement = document.getElementById('dhtmlx-progress-count');
    
    if (completedElement) completedElement.textContent = completed;
    if (progressElement) progressElement.textContent = inProgress;
}

// ✅ applyInitialGrouping() removed - now using dropdown-controlled client-side grouping
  
// /*
//  * DHtmlX Gantt Initialization Script for Kanboard
//  */

// document.addEventListener('DOMContentLoaded', function() {
//     console.log('DOM loaded, initializing DHtmlX Gantt...');
    
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
    // --- Group-by dropdown: navigate with &group_by=<value> (CSP-safe) ---
    if (!window.__groupByBound) {
        window.__groupByBound = true;
        var sel = document.getElementById('group-by-select');
        if (sel) {
          var base = sel.getAttribute('data-nav-base') || '';
          sel.addEventListener('change', function () {
            try {
              var url = new URL(base, window.location.origin);
              url.searchParams.set('group_by', sel.value);
              window.location.assign(url.toString());
            } catch (e) {
              var glue = base.indexOf('?') === -1 ? '?' : '&';
              window.location.assign(base + glue + 'group_by=' + encodeURIComponent(sel.value));
            }
          });
        }
      }
    
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
    applyInitialGrouping();

    
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
    
    // Enable plugins
    gantt.plugins({
        tooltip: true,
        keyboard_navigation: true,
        undo: true,
        grouping: true
        // NOTE: auto_scheduling is a PRO feature, not available in GPL
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
    
    // Task text template - show task name with assignee for regular tasks, "M" for milestones
    gantt.templates.task_text = function(start, end, task) {
        if (task.is_milestone) {
            return "M";
        }
        
        var text = task.text;
        // Add assignee name in brackets if available
        if (task.assignee && task.assignee.trim() !== '') {
            text += " [" + task.assignee + "]";
        }
        return text;
    };
    
    // Right-side text template - show assignee with icon
    gantt.templates.rightside_text = function(start, end, task) {
        if (task.assignee && task.assignee.trim() !== '') {
            return "👤 " + task.assignee;
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
    {name: "type", height: 22, map_to: "is_milestone", type: "select", options: [
        {key: false, label: "Task"},
        {key: true, label: "Milestone"}
    ]},
    {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
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
    
    // Always use type "task" for rendering (rectangular bars)
    task.type = "task";
    
    // Ensure is_milestone is properly set (convert 1/0 or "1"/"0" to boolean)
    if (task.is_milestone === 1 || task.is_milestone === "1" || task.is_milestone === true) {
        task.is_milestone = true;
    } else if (task.is_milestone === undefined || task.is_milestone === null) {
        task.is_milestone = false;
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
    
    // Set the value on the CLONED element
    if (shouldBeMilestone) {
        newTypeSelect.value = 'true';
        console.log('Set type select to Milestone for task:', taskId);
    } else {
        newTypeSelect.value = 'false';
        console.log('Set type select to Task for task:', taskId);
    }
    
    typeSelect.parentNode.replaceChild(newTypeSelect, typeSelect);
    typeSelect = newTypeSelect;
    
    // Function to toggle fields based on type
    var toggleFields = function() {
        // Select dropdown value can be string "true"/"false" or boolean
        var isMilestone = typeSelect.value === 'true' || typeSelect.value === true || typeSelect.value === 'milestone';
        
        console.log('Toggling fields, isMilestone:', isMilestone, 'value:', typeSelect.value, 'type:', typeof typeSelect.value);
        
        // Scope to the lightbox markup
        var lightbox = document.querySelector('.gantt_cal_light');
        if (!lightbox) return;

        // Hide/show Priority section (select with title="priority")
        var prioritySelect = lightbox.querySelector('select[title="priority"]');
        if (prioritySelect) {
            var prContent = prioritySelect.closest('.gantt_cal_ltext') || prioritySelect.parentElement;
            var prLabel = prContent && prContent.previousElementSibling && prContent.previousElementSibling.classList && prContent.previousElementSibling.classList.contains('gantt_cal_lsection') ? prContent.previousElementSibling : null;
            if (prContent) prContent.style.display = isMilestone ? 'none' : '';
            if (prLabel) prLabel.style.display = isMilestone ? 'none' : '';
            console.log('Priority section hidden:', isMilestone, 'content:', !!prContent, 'label:', !!prLabel);
        } else {
            console.log('Priority select not found');
        }

        // Hide/show only the duration numeric input (keep start date selects visible)
        var durationCandidates = lightbox.querySelectorAll(
            '.gantt_time input[type="number"],\
             .gantt_time input[aria-label="Duration"],\
             .gantt_time input[id*="duration"],\
             .gantt_time .gantt_duration input,\
             .gantt_time .gantt_duration_value'
        );
        console.log('Duration numeric inputs found:', durationCandidates.length);
        durationCandidates.forEach(function(inp){
            if (inp && inp.style) inp.style.display = isMilestone ? 'none' : '';
            var wrap = inp.closest('.gantt_duration, .gantt_duration_line, .gantt_time_duration');
            if (wrap && wrap !== lightbox) wrap.style.display = isMilestone ? 'none' : '';
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

// Handle milestone save to keep type as task and apply green color
gantt.attachEvent("onLightboxSave", function(id, task, is_new) {
    console.log('Lightbox save, task:', task);
    console.log('Task owner_id:', task.owner_id, 'group_id:', task.group_id, 'is_milestone:', task.is_milestone);
    
    // Ensure owner_id is properly set (convert string to integer if needed)
    if (task.owner_id !== undefined && task.owner_id !== null) {
        task.owner_id = parseInt(task.owner_id) || 0;
        console.log('Converted owner_id to:', task.owner_id);
    }
    
    // Validation: Task must be assigned to someone (cannot be Unassigned)
    if (!task.owner_id || task.owner_id === 0) {
        alert('Error: Task must be assigned to a user. Please select someone from the "Assign To" dropdown.');
        console.error('Validation failed: Task must be assigned to a user');
        return false; // Prevent saving
    }
    
    // Always keep type as "task" for rectangular bars
    task.type = "task";
    
    // Convert is_milestone to proper boolean/string format
    // DHtmlX select returns the key value (true/false as boolean, or "true"/"false" as string)
    if (task.is_milestone === true || task.is_milestone === "true" || task.is_milestone === 1 || task.is_milestone === "1") {
        task.is_milestone = true;
        task.color = "#27ae60";
        console.log('Set milestone color to green for task:', id);
    } else {
        task.is_milestone = false;
        // Reset color if changed from milestone to task (let server/priority determine color)
        console.log('Task is not a milestone, keeping original color');
    }
    
    return true; // Allow saving
});

gantt.form_blocks["template"] = {
    render: function(sns) {
        return "<div class='dhtmlx_cal_ltext' style='height:" + sns.height + "px;'></div>";
    },
    set_value: function(node, value, task, section) {
        var projectId = document.getElementById('dhtmlx-gantt-chart').getAttribute('data-project-id');
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
    if (tasks.length === 0) return;
    
    // Find actual date range
    var minDate = null, maxDate = null;
    tasks.forEach(function(task) {
        var start = task.start_date;
        var end = task.end_date || gantt.calculateEndDate(start, task.duration);
        if (!minDate || start < minDate) minDate = start;
        if (!maxDate || end > maxDate) maxDate = end;
    });
    
    // Add 10% padding
    var diff = (maxDate - minDate) / 10;
    minDate = new Date(minDate.getTime() - diff);
    maxDate = new Date(maxDate.getTime() + diff);
    
    // Calculate best zoom level
    var container = document.getElementById('dhtmlx-gantt-chart');
    var availableWidth = container.offsetWidth - gantt.config.grid_width;
    var totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
    var pixelsPerDay = availableWidth / totalDays;
    
    // Pick level: >80px/day=hour, >40=day, >15=week, else month
    var level = pixelsPerDay > 80 ? 0 : pixelsPerDay > 40 ? 1 : pixelsPerDay > 15 ? 2 : 3;
    
    // Apply
    gantt.config.scales = zoomLevels[level].scales;
    gantt.config.start_date = minDate;
    gantt.config.end_date = maxDate;
    gantt.render();
    currentZoomLevel = level;
    
    // Scroll to start
    gantt.showDate(minDate);
}
//new

  
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
            
            // Send create request to server including all fields
            fetch(window.ganttUrls.create, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: task.text,
                    start_date: task.start_date,
                    end_date: task.end_date,
                    priority: task.priority || 'normal',
                    owner_id: task.owner_id || 0,
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
        
        // Handle task updates - batch updates to avoid interfering with auto-scheduling
        gantt.attachEvent("onAfterTaskUpdate", function(id, task) {
            console.log('Task updated:', id, task.text);
            
            // Apply green color if milestone
            if (task.is_milestone) {
                task.color = "#27ae60";
                gantt.refreshTask(id); // Force re-render with new color
            }
            
            // Add task to save queue instead of saving immediately
            tasksToSave[id] = {
                id: id,
                text: task.text,
                start_date: task.start_date,
                end_date: task.end_date,
                priority: task.priority,
                is_milestone: task.is_milestone ? 1 : 0
            };
            
            // Debounce: wait for auto-scheduling to complete before saving
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(function() {
                saveQueuedTasks();
            }, 500); // Wait 500ms for auto-scheduling to finish
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
    
    var fitBtn = document.getElementById('dhtmlx-fit');
    if (fitBtn) {
        fitBtn.addEventListener('click', function() {
        smartFitToScreen();
    });
}

var groupByAssigneeBtn = document.getElementById('dhtmlx-group-assignee');
if (groupByAssigneeBtn) {
    var isGrouped = false;
    groupByAssigneeBtn.addEventListener('click', function() {
        if (!isGrouped) {
            groupByAssignee();
            this.classList.add('active');
            isGrouped = true;
        } else {
            clearGrouping();
            this.classList.remove('active');
            isGrouped = false;
        }
    });
}//NEWNEW

    
    // Expand all button
    var expandBtn = document.getElementById('dhtmlx-expand-all');
    if (expandBtn) {
        expandBtn.addEventListener('click', function() {
            gantt.eachTask(function(task) {
                task.$open = true;
            });
            gantt.render();
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



//new
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
//new

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
// ---------------------------
// Group-by initialization
// ---------------------------
function applyInitialGrouping() {
    if (typeof gantt === 'undefined' || !gantt.groupBy) return;
  
    var container = document.getElementById('dhtmlx-gantt-chart');
    var mode = (container && container.getAttribute('data-group-by')) || 'none';
  
    console.log('[Grouping] Applying initial mode:', mode);
  
    if (mode === 'none') {
      gantt.groupBy(false); // clear grouping
    } else if (mode === 'assignee' || mode === 'group' || mode === 'sprint') {
      gantt.groupBy({
        relation_property: mode,  // task.assignee / task.group / task.sprint
        default_group_label: '—'
      });
    }
  }
  
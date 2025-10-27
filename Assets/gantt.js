/*
 * Kanboard DHtmlX Gantt Plugin - Custom JavaScript
 * 
 * This file contains custom JavaScript functionality for the DHtmlX Gantt plugin.
 * It extends the base DHtmlX Gantt library with Kanboard-specific features.
 */

(function() {
    'use strict';

    // Wait for DHtmlX Gantt to be loaded
    function initKanboardGanttExtensions() {
        if (typeof gantt === 'undefined') {
            setTimeout(initKanboardGanttExtensions, 100);
            return;
        }

        // Custom data processor for Kanboard API
        function createKanboardDataProcessor(config) {
            var dp = new gantt.dataProcessor(config);
            
            // Override the default serialize method to match Kanboard's expected format
            dp.setTransactionMode("JSON", true);
            
            // Custom error handling
            dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
                if (action === "error") {
                    console.error("Gantt operation failed:", response);
                    gantt.message({
                        type: "error",
                        text: response.message || "Operation failed"
                    });
                    return false;
                }
                
                if (response && response.message) {
                    gantt.message({
                        type: "info",
                        text: response.message
                    });
                }
                
                return true;
            });
            
            return dp;
        }

        // Enhanced tooltip with Kanboard-specific information
        gantt.templates.tooltip_text = function(start, end, task) {
            var html = "<b>Task:</b> " + task.text + "<br/>";
            html += "<b>Start:</b> " + gantt.templates.tooltip_date_format(start) + "<br/>";
            html += "<b>End:</b> " + gantt.templates.tooltip_date_format(end) + "<br/>";
            html += "<b>Progress:</b> " + Math.round(task.progress * 100) + "%<br/>";
            
            if (task.priority) {
                html += "<b>Priority:</b> " + task.priority + "<br/>";
            }
            
            if (task.assignee) {
                html += "<b>Assignee:</b> " + task.assignee + "<br/>";
            }
            
            if (task.column_title) {
                html += "<b>Status:</b> " + task.column_title + "<br/>";
            }
            
            if (task.link) {
                html += "<br/><a href='" + task.link + "' target='_blank'>View in Kanboard</a>";
            }
            
            return html;
        };

        // Custom task class for better styling
        gantt.templates.task_class = function(start, end, task) {
            var classes = [];
            
            if (task.priority) {
                classes.push("dhtmlx-priority-" + task.priority);
            }
            
            if (task.readonly) {
                classes.push("dhtmlx-readonly");
            }
            
            if (task.type === "milestone") {
                classes.push("dhtmlx-milestone");
            }
            
            return classes.join(" ");
        };

        // Custom progress text
        gantt.templates.progress_text = function(start, end, task) {
            return "<span class='dhtmlx-progress-text'>" + Math.round(task.progress * 100) + "%</span>";
        };

        // Enhanced context menu
        if (gantt.ext && gantt.ext.contextmenu) {
            gantt.ext.contextmenu.attachEvent("onBeforeShow", function(id, point) {
                // Add custom menu items based on task properties
                var task = gantt.getTask(id);
                var items = gantt.ext.contextmenu.getItems();
                
                // Add "View in Kanboard" option
                if (task.link) {
                    items.push({
                        text: "View in Kanboard",
                        id: "view_kanboard",
                        href: task.link,
                        target: "_blank"
                    });
                }
                
                return true;
            });
        }

        // Keyboard shortcuts for common operations
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        gantt.createTask();
                        break;
                    case 's':
                        e.preventDefault();
                        // Save all changes (if auto-save is disabled)
                        gantt.message("Changes saved automatically");
                        break;
                    case 'z':
                        if (gantt.ext && gantt.ext.undo) {
                            e.preventDefault();
                            gantt.ext.undo.undo();
                        }
                        break;
                    case 'y':
                        if (gantt.ext && gantt.ext.undo) {
                            e.preventDefault();
                            gantt.ext.undo.redo();
                        }
                        break;
                }
            }
        });

        // Auto-refresh functionality (optional)
        function setupAutoRefresh(intervalMinutes) {
            if (intervalMinutes > 0) {
                setInterval(function() {
                    // Refresh gantt data from server
                    gantt.clearAll();
                    gantt.load(window.location.href);
                }, intervalMinutes * 60000);
            }
        }

        // Utility functions
        window.KanboardGantt = {
            // Create data processor with Kanboard-specific settings
            createDataProcessor: createKanboardDataProcessor,
            
            // Setup auto-refresh
            setupAutoRefresh: setupAutoRefresh,
            
            
            // Highlight tasks by criteria
            highlightTasks: function(criteria) {
                gantt.eachTask(function(task) {
                    var element = gantt.getTaskNode(task.id);
                    if (element) {
                        if (criteria(task)) {
                            element.classList.add('dhtmlx-highlighted');
                        } else {
                            element.classList.remove('dhtmlx-highlighted');
                        }
                    }
                });
            },
            
            // Get project statistics
            getProjectStats: function() {
                var stats = {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    notStarted: 0,
                    overdue: 0
                };
                
                var now = new Date();
                
                gantt.eachTask(function(task) {
                    stats.total++;
                    
                    if (task.progress >= 1) {
                        stats.completed++;
                    } else if (task.progress > 0) {
                        stats.inProgress++;
                    } else {
                        stats.notStarted++;
                    }
                    
                    if (task.end_date && new Date(task.end_date) < now && task.progress < 1) {
                        stats.overdue++;
                    }
                });
                
                return stats;
            }
        };
        function parentOf(task) {
            // DHTMLX stores parent IDs (0 or null if top-level)
            return (task && (task.parent !== undefined && task.parent !== null)) ? task.parent : 0;
        }

        function sameLevelAllowed(srcTask, tgtTask) {
            const ps = parentOf(srcTask);
            const pt = parentOf(tgtTask);
            return (ps === 0 && pt === 0) || (ps !== 0 && ps === pt);
        }

        // Intercept link creation before it’s added
        gantt.attachEvent("onBeforeLinkAdd", function(id, link) {
            const s = gantt.getTask(link.source);
            const t = gantt.getTask(link.target);

            if (!sameLevelAllowed(s, t)) {
                // Show a hint (uses DHTMLX's built-in message system)
                gantt.message({
                    text: "⚠️ Dependency rule violated — links can only connect sibling tasks or top-level tasks.",
                    type: "warning",
                    expire: 4000
                });
                return false; // cancel link creation
            }
            return true; // allow valid link
        });
        console.log("Kanboard DHtmlX Gantt extensions loaded successfully");
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKanboardGanttExtensions);
    } else {
        initKanboardGanttExtensions();
    }
})();

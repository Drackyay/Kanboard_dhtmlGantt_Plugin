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
     
        function createKanboardDataProcessor(config) {
            var dp = new gantt.dataProcessor(config);
            
            // Send JSON payloads
            dp.setTransactionMode("JSON", true);
            
            // Unified error + info handling (including circular dependency)
            dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
                var payload = null;

                // Try to normalize response into a JS object
                if (response && typeof response === "object") {
                    // DHTMLX often wraps XHR in xmlDoc
                    if (response.xmlDoc && response.xmlDoc.responseText) {
                        try { payload = JSON.parse(response.xmlDoc.responseText); } catch (e) {}
                    } else if (response.responseText) {
                        try { payload = JSON.parse(response.responseText); } catch (e) {}
                    } else {
                        payload = response;
                    }
                } else if (typeof response === "string") {
                    try { payload = JSON.parse(response); } catch (e) {}
                }

                // If action flagged as error OR payload says result:error → show error toast
                if (action === "error" || (payload && payload.result === "error")) {
                    var msg = (payload && payload.message) || "Operation failed";
                    console.error("Gantt operation failed:", payload || response);
                    gantt.message({
                        type: "error",
                        text: "⚠️ " + msg
                    });
                    return false;
                }
                
                // Otherwise, if backend sent a message, show as info
                if (payload && payload.message) {
                    gantt.message({
                        type: "info",
                        text: payload.message
                    });
                }
                
                return true;
            });
            
            return dp;
        }

    
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

        // Assignee label on right side of bar
        gantt.templates.rightside_text = function(start, end, task) {
            return task.assignee ? String(task.assignee) : "";
        };


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

        // Progress text overlay
        gantt.templates.progress_text = function(start, end, task) {
            return "<span class='dhtmlx-progress-text'>" + Math.round(task.progress * 100) + "%</span>";
        };


        if (gantt.ext && gantt.ext.contextmenu) {
            gantt.ext.contextmenu.attachEvent("onBeforeShow", function(id, point) {
                var task = gantt.getTask(id);
                var items = gantt.ext.contextmenu.getItems();
                
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

        // -----------------------------
        // Keyboard Shortcuts
        // -----------------------------
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        gantt.createTask();
                        break;
                    case 's':
                        e.preventDefault();
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

        function setupAutoRefresh(intervalMinutes) {
            if (intervalMinutes > 0) {
                setInterval(function() {
                    gantt.clearAll();
                    gantt.load(window.location.href);
                }, intervalMinutes * 60000);
            }
        }

  
        window.KanboardGantt = {
            createDataProcessor: createKanboardDataProcessor,
            setupAutoRefresh: setupAutoRefresh,
            
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

        // Basic front-end circular detection: disallow reverse link
        function isCircularLink(link) {
            var existing = gantt.getLinks();
            for (var i = 0; i < existing.length; i++) {
                var l = existing[i];
                if (String(l.source) === String(link.target) &&
                    String(l.target) === String(link.source)) {
                    return true;
                }
            }
            return false;
        }

        // Intercept link creation before it’s added
        gantt.attachEvent("onBeforeLinkAdd", function(id, link) {
            const s = gantt.getTask(link.source);
            const t = gantt.getTask(link.target);

            // 1) Same-level rule
            if (!sameLevelAllowed(s, t)) {
                gantt.message({
                    text: "⚠️ Dependency rule violated — links can only connect sibling tasks or top-level tasks.",
                    type: "warning",
                    expire: 4000
                });
                return false;
            }

            // 2) Circular rule (A→B when B→A exists) --> error message displayed
            if (isCircularLink(link)) {
                gantt.message({
                    text: "⚠️ Circular dependency detected",
                    type: "error",
                    expire: 4000
                });
                return false;
            }

            return true; // allow valid link
        });

  

        // Read initial state from checkbox (if present in template)
        var moveToggleEl = document.getElementById('dhtmlx-move-dependencies-toggle');
        window.moveDependenciesEnabled = !!(moveToggleEl && moveToggleEl.checked);

        if (moveToggleEl) {
            moveToggleEl.addEventListener('change', function(e) {
                window.moveDependenciesEnabled = !!e.target.checked;
            });
        }

        // Remember original dates before drag
        gantt.attachEvent("onBeforeTaskDrag", function(id, mode, e) {
            var task = gantt.getTask(id);
            task._original_start_date = new Date(task.start_date);
            task._original_end_date   = new Date(task.end_date);
            return true;
        });

        function formatGanttDate(d) {
            return gantt.date.date_to_str("%Y-%m-%d %H:%i")(d);
        }

        // After drag, optionally shift dependents + persist them
        gantt.attachEvent("onAfterTaskDrag", function(id, mode, e) {
            if (!window.moveDependenciesEnabled) {
                return true;
            }

            var moved = gantt.getTask(id);
            if (!moved._original_start_date) {
                return true;
            }

            var shiftMs = moved.start_date - moved._original_start_date;
            if (!shiftMs) {
                return true;
            }

            gantt.getLinks().forEach(function(link) {
                if (String(link.source) === String(id)) {
                    var dep = gantt.getTask(link.target);
                    if (!dep) return;

                    dep.start_date = new Date(dep.start_date.getTime() + shiftMs);
                    dep.end_date   = new Date(dep.end_date.getTime() + shiftMs);
                    gantt.updateTask(dep.id);

                    if (window.ganttUrls && window.ganttUrls.update) {
                        fetch(window.ganttUrls.update, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                id: dep.id,
                                start_date: formatGanttDate(dep.start_date),
                                end_date: formatGanttDate(dep.end_date)
                            })
                        }).catch(function(err) {
                            console.error("Failed to persist dependent task", dep.id, err);
                        });
                    }
                }
            });

            delete moved._original_start_date;
            delete moved._original_end_date;
            return true;
        });

        console.log("Kanboard DHtmlX Gantt extensions loaded successfully");
    }


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKanboardGanttExtensions);
    } else {
        initKanboardGanttExtensions();
    }
})();

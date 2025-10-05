<?php

namespace Kanboard\Plugin\DhtmlGantt;

use Kanboard\Core\Plugin\Base;
use Kanboard\Core\Security\Role;
use Kanboard\Core\Translator;
use Kanboard\Plugin\DhtmlGantt\Formatter\ProjectGanttFormatter;
use Kanboard\Plugin\DhtmlGantt\Formatter\TaskGanttFormatter;

class Plugin extends Base
{
    public function initialize()
    {
        $this->route->addRoute('dhtmlgantt/:project_id', 'TaskGanttController', 'show', 'plugin');
        $this->route->addRoute('dhtmlgantt/:project_id/sort/:sorting', 'TaskGanttController', 'show', 'plugin');

        $this->projectAccessMap->add('ProjectGanttController', 'save', Role::PROJECT_MANAGER);
        $this->projectAccessMap->add('TaskGanttController', 'save', Role::PROJECT_MEMBER);

        $this->template->hook->attach('template:project-header:view-switcher', 'DhtmlGantt:project_header/views');
        $this->template->hook->attach('template:project:dropdown', 'DhtmlGantt:project/dropdown');
        $this->template->hook->attach('template:project-list:menu:after', 'DhtmlGantt:project_list/menu');
        $this->template->hook->attach('template:config:sidebar', 'DhtmlGantt:config/sidebar');

        // Load DHtmlX Gantt library first
        $this->hook->on('template:layout:js', array('template' => 'plugins/DhtmlGantt/Assets/dhtmlxgantt.js'));
        $this->hook->on('template:layout:css', array('template' => 'plugins/DhtmlGantt/Assets/dhtmlxgantt.css'));

        // Load our custom Gantt implementation after the library
        $this->hook->on('template:layout:js', array('template' => 'plugins/DhtmlGantt/Assets/gantt.js'));
        $this->hook->on('template:layout:js', array('template' => 'plugins/DhtmlGantt/Assets/dhtmlx-init.js'));
        $this->hook->on('template:layout:css', array('template' => 'plugins/DhtmlGantt/Assets/gantt.css'));

        $this->container['projectGanttFormatter'] = $this->container->factory(function ($c) {
            return new ProjectGanttFormatter($c);
        });

        $this->container['taskGanttFormatter'] = $this->container->factory(function ($c) {
            return new TaskGanttFormatter($c);
        });
    }

    public function onStartup()
    {
        Translator::load($this->languageModel->getCurrentLanguage(), __DIR__.'/Locale');
    }

    public function getPluginName()
    {
        return 'DHtmlX Gantt';
    }

    public function getPluginDescription()
    {
        return t('Advanced Gantt charts with enterprise features powered by DHtmlX Gantt');
    }

    public function getPluginAuthor()
    {
        return 'USCCS401 Team14';
    }

    public function getPluginVersion()
    {
        return '1.0.0';
    }

    public function getPluginHomepage()
    {
        return 'https://github.com/yourusername/kanboard-dhtmlx-gantt';
    }

    public function getCompatibleVersion()
    {
        return '>1.2.3';
    }
}

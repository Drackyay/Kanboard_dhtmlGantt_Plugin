<?php

namespace Kanboard\Plugin\DhtmlGantt;

use Kanboard\Core\Plugin\Base;
use Kanboard\Core\Translator;

/**
 * DHtmlX Gantt Plugin for Kanboard
 *
 * @package  Kanboard\Plugin\DhtmlGantt
 * @author   Your Name
 */
class Plugin extends Base
{
    public function initialize()
    {
        // Template hooks
        $this->template->hook->attach('template:project:sidebar', 'DhtmlGantt:project/sidebar');
        $this->template->hook->attach('template:project-header:view-switcher', 'DhtmlGantt:project-header/view-switcher');
        $this->template->hook->attach('template:project-list:menu:before', 'DhtmlGantt:project-list/menu');
        
        // CSS/JS assets
        $this->hook->on('template:layout:css', array('template' => 'plugins/DhtmlGantt:assets/dhtmlxgantt.css'));
        $this->hook->on('template:layout:js', array('template' => 'plugins/DhtmlGantt:assets/dhtmlxgantt.js'));
    }

    public function onStartup()
    {
        Translator::load($this->languageModel->getCurrentLanguage(), __DIR__.'/Locale');
    }

    public function getClasses()
    {
        return array(
            'Plugin\DhtmlGantt\Controller' => array(
                'ProjectGanttController',
                'TaskGanttController',
            ),
            'Plugin\DhtmlGantt\Formatter' => array(
                'ProjectGanttFormatter',
                'TaskGanttFormatter',
            ),
        );
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
        return 'Your Name';
    }

    public function getPluginVersion()
    {
        return '1.0.0';
    }

    public function getCompatibleVersion()
    {
        return '>=1.2.3';
    }

    public function getPluginHomepage()
    {
        return 'https://github.com/yourusername/kanboard-dhtmlx-gantt';
    }
}

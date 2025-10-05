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
        
        // CSS/JS assets - Using CDN in template instead of local files
        // Local asset loading disabled - using CDN links in template
        
        // Custom routes for Gantt functionality
        $this->route->addRoute('/gantt/json/:project_id', 'GanttController', 'data', 'DhtmlGantt');
        $this->route->addRoute('/gantt/show/:project_id', 'ProjectGanttController', 'show', 'DhtmlGantt');
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
                'GanttController',
            ),
            'Plugin\DhtmlGantt\Formatter' => array(
                'ProjectGanttFormatter',
                'GanttDataFormatter',
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

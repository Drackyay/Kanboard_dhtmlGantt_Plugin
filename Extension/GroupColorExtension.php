<?php

namespace Kanboard\Plugin\DhtmlGantt\Extension;

use Kanboard\Core\Base;

/**
 * Group Color Extension
 * 
 * Generates consistent colors for groups using CRC32 hashing
 * Same algorithm as Group_assign plugin for consistency
 *
 * @package  Kanboard\Plugin\DhtmlGantt\Extension
 */
class GroupColorExtension extends Base
{
    /**
     * Generate a color code for a group name using CRC32 hash
     * 
     * @param  string $str Group name
     * @return string 6-character hex color code (without #)
     */
    public function getGroupColor($str)
    {
        // Hash the group name using CRC32
        $code = dechex(crc32($str));
        
        // Take first 6 hex characters
        $code = substr($code, 0, 6);
        
        return $code;
    }
}


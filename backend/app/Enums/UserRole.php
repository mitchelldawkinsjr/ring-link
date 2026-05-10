<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case Wrestler = 'wrestler';
    case Promotion = 'promotion';
    case Admin = 'admin';
}

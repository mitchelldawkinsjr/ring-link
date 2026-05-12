<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

final class EnsureUserRole
{
    /**
     * @param  string  ...$roles  Comma-separated role names from route parameter
     */
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = $request->user();
        if (! $user) {
            throw new AccessDeniedHttpException('Unauthenticated.');
        }

        $allowed = array_map(static fn (string $r) => UserRole::from($r), $roles);
        $current = $user->role instanceof UserRole ? $user->role : UserRole::from((string) $user->role);

        foreach ($allowed as $role) {
            if ($current === $role) {
                return $next($request);
            }
        }

        throw new AccessDeniedHttpException('This action is not allowed for your role.');
    }
}

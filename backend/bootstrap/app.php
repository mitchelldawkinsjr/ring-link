<?php

use App\Exceptions\InvalidStateTransitionException;
use App\Http\Middleware\EnsureUserRole;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api/v1',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Token auth via `Authorization: Bearer` only — no SPA session/CSRF on `/api/*`.
        // Re-enable `$middleware->statefulApi()` if you switch to cookie-based Sanctum.
        $middleware->alias([
            'role' => EnsureUserRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'data' => null,
                    'meta' => ['errors' => $e->errors()],
                    'message' => 'Validation failed',
                ], 422);
            }
        });
        $exceptions->render(function (InvalidStateTransitionException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'data' => null,
                    'meta' => [],
                    'message' => $e->getMessage(),
                ], 422);
            }
        });
        $exceptions->render(function (AccessDeniedHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'data' => null,
                    'meta' => [],
                    'message' => $e->getMessage() ?: 'Forbidden',
                ], 403);
            }
        });
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'data' => null,
                    'meta' => [],
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });
    })->create();

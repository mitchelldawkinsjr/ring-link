<?php

return [
  'prefix' => '/api/v1',
  'endpoints' => [
    'POST /auth/register',
    'POST /auth/login',
    'POST /auth/logout',
    'GET /wrestlers',
    'POST /wrestlers',
    'PATCH /wrestlers/{id}',
    'POST /submissions',
    'PATCH /submissions/{id}/status',
    'POST /bookings',
    'PATCH /bookings/{id}/status',
    'POST /reviews',
  ],
];

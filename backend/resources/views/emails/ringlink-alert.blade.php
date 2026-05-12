<x-mail::message>
# RingLink notification

**Type:** {{ $alertType }}

@if(!empty($payload))
**Details:**
@foreach($payload as $key => $value)
- {{ $key }}: {{ is_scalar($value) ? $value : json_encode($value) }}
@endforeach
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

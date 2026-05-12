<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiEnvelope;
use App\Models\MediaLink;
use App\Models\WrestlerProfile;
use Aws\S3\S3Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class MediaController extends Controller
{
    public function listOwn(Request $request): JsonResponse
    {
        $wrestler = $request->user()->wrestlerProfile;
        abort_if(! $wrestler, 403);

        $media = $wrestler->mediaLinks()
            ->orderBy('sort_order')
            ->orderBy('created_at')
            ->get()
            ->map(fn (MediaLink $m) => [
                'id' => $m->id,
                'url' => $m->url,
                'media_type' => $m->media_type,
                'sort_order' => $m->sort_order,
            ]);

        return ApiEnvelope::json($media->all());
    }

    public function uploadIntent(Request $request): JsonResponse
    {
        $wrestler = $request->user()->wrestlerProfile;
        abort_if(! $wrestler, 403);

        $data = $request->validate([
            'filename' => ['required', 'string', 'max:255'],
            'content_type' => ['required', 'string', 'max:120'],
            'media_type' => ['required', 'string', 'max:40'],
        ]);

        $disk = config('filesystems.upload_disk', 'public');
        $key = 'wrestlers/'.$wrestler->id.'/'.Str::uuid().'_'.$data['filename'];

        if (in_array($disk, ['r2', 's3'], true) && config("filesystems.disks.$disk.key")) {
            $cfg = config("filesystems.disks.$disk");
            $client = new S3Client([
                'version' => 'latest',
                'region' => $cfg['region'],
                'endpoint' => $cfg['endpoint'] ?? null,
                'credentials' => [
                    'key' => $cfg['key'],
                    'secret' => $cfg['secret'],
                ],
                'use_path_style_endpoint' => $cfg['use_path_style_endpoint'] ?? false,
            ]);
            $cmd = $client->getCommand('PutObject', [
                'Bucket' => $cfg['bucket'],
                'Key' => $key,
                'ContentType' => $data['content_type'],
            ]);
            $putUrl = (string) $client->createPresignedRequest($cmd, '+15 minutes')->getUri();
            $publicUrl = rtrim((string) ($cfg['url'] ?? ''), '/').'/'.$key;

            return ApiEnvelope::json([
                'upload_url' => $putUrl,
                'key' => $key,
                'public_url' => $publicUrl,
                'media_type' => $data['media_type'],
            ]);
        }

        // Local / tests: direct upload placeholder
        $path = $key;
        Storage::disk('public')->put($path, '');
        $url = Storage::disk('public')->url($path);

        return ApiEnvelope::json([
            'upload_url' => null,
            'key' => $path,
            'public_url' => $url,
            'media_type' => $data['media_type'],
            'note' => 'Use POST /wrestlers/media/confirm for local disk.',
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $wrestler = $request->user()->wrestlerProfile;
        abort_if(! $wrestler, 403);

        $data = $request->validate([
            'url' => ['required', 'string', 'max:500'],
            'media_type' => ['required', 'string', 'max:40'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
        ]);

        $media = MediaLink::query()->create([
            'wrestler_profile_id' => $wrestler->id,
            'media_type' => $data['media_type'],
            'url' => $data['url'],
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return ApiEnvelope::json([
            'id' => $media->id,
            'url' => $media->url,
            'media_type' => $media->media_type,
            'sort_order' => $media->sort_order,
        ], [], 'Created', 201);
    }

    /**
     * Direct server-side photo upload for the authenticated wrestler.
     *
     * Stores to R2/S3 if those creds are configured, otherwise to the
     * `public` local disk (served via `storage:link` -> /storage/...).
     * Returns the created MediaLink row.
     *
     * Sort_order convention:
     *  - photos:   0..9   (0 is the primary hero image)
     *  - videos:   10+    (managed by storeVideo)
     */
    public function upload(Request $request): JsonResponse
    {
        $wrestler = $request->user()->wrestlerProfile;
        abort_if(! $wrestler, 403);

        $data = $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:jpeg,jpg,png,webp,gif', 'max:10240'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9'],
        ]);

        $configuredDisk = (string) config('filesystems.upload_disk', 'public');
        $useCloud = in_array($configuredDisk, ['r2', 's3'], true)
            && config("filesystems.disks.$configuredDisk.key");
        $disk = $useCloud ? $configuredDisk : 'public';

        /** @var UploadedFile $file */
        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
        $folder = 'wrestlers/'.$wrestler->id;
        $filename = Str::uuid()->toString().'.'.$ext;
        $key = $folder.'/'.$filename;

        Storage::disk($disk)->putFileAs($folder, $file, $filename, [
            'visibility' => 'public',
        ]);

        $url = $useCloud
            ? rtrim((string) config("filesystems.disks.$disk.url"), '/').'/'.$key
            : Storage::disk('public')->url($key);

        // If no explicit sort_order: append after existing photos but never
        // collide with videos. Cap at 9.
        $sortOrder = $data['sort_order'] ?? null;
        if ($sortOrder === null) {
            $nextPhoto = (int) $wrestler->mediaLinks()
                ->where('sort_order', '<', 10)
                ->max('sort_order');
            $sortOrder = min(9, $nextPhoto + 1);
        }

        $media = MediaLink::query()->create([
            'wrestler_profile_id' => $wrestler->id,
            'media_type' => 'photo',
            'url' => $url,
            'sort_order' => $sortOrder,
        ]);

        return ApiEnvelope::json([
            'id' => $media->id,
            'url' => $media->url,
            'media_type' => $media->media_type,
            'sort_order' => $media->sort_order,
        ], [], 'Uploaded', 201);
    }

    public function destroy(Request $request, MediaLink $mediaLink): JsonResponse
    {
        $this->authorize('manage', $mediaLink);
        $mediaLink->delete();

        return ApiEnvelope::json(null, [], 'Deleted');
    }

    /**
     * Attach a hosted video (YouTube or Vimeo) to the authenticated wrestler.
     * Stores media_type as "video_youtube" or "video_vimeo" so consumers can
     * filter on the family with `video_*` and still know the provider.
     */
    public function storeVideo(Request $request): JsonResponse
    {
        $wrestler = $request->user()->wrestlerProfile;
        abort_if(! $wrestler, 403);

        $data = $request->validate([
            'url' => ['required', 'string', 'max:500', 'url'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
        ]);

        $provider = self::detectVideoProvider($data['url']);
        if ($provider === null) {
            return ApiEnvelope::json(null, [], 'Only YouTube and Vimeo URLs are supported.', 422);
        }

        $existingMaxOrder = (int) $wrestler->mediaLinks()
            ->where('media_type', 'like', 'video_%')
            ->max('sort_order');
        $sortOrder = $data['sort_order'] ?? max(10, $existingMaxOrder + 1);

        $media = MediaLink::query()->create([
            'wrestler_profile_id' => $wrestler->id,
            'media_type' => 'video_'.$provider,
            'url' => $data['url'],
            // Photos start at sort_order=0; videos live in the +10 range so the
            // discover/talent-card thumbnail logic stays predictable.
            'sort_order' => max(10, $sortOrder),
        ]);

        return ApiEnvelope::json([
            'id' => $media->id,
            'url' => $media->url,
            'media_type' => $media->media_type,
            'sort_order' => $media->sort_order,
        ], [], 'Created', 201);
    }

    private static function detectVideoProvider(string $url): ?string
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        $host = preg_replace('/^www\./', '', $host ?? '');

        $youtube = ['youtube.com', 'youtu.be', 'm.youtube.com', 'music.youtube.com'];
        $vimeo = ['vimeo.com', 'player.vimeo.com'];

        if (in_array($host, $youtube, true)) {
            return 'youtube';
        }
        if (in_array($host, $vimeo, true)) {
            return 'vimeo';
        }

        return null;
    }

    public function reorder(Request $request, WrestlerProfile $wrestlerProfile): JsonResponse
    {
        $this->authorize('update', $wrestlerProfile);
        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:media_links,id'],
        ]);
        foreach ($data['order'] as $index => $id) {
            MediaLink::query()->where('id', $id)->where('wrestler_profile_id', $wrestlerProfile->id)->update(['sort_order' => $index]);
        }

        return ApiEnvelope::json(['ok' => true]);
    }
}

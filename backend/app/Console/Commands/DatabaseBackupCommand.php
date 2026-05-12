<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;

final class DatabaseBackupCommand extends Command
{
    protected $signature = 'ringlink:backup-db {--path=backups/database.sql.gz}';

    protected $description = 'Dump MySQL to gzip and upload to R2/S3 (requires mysqldump)';

    public function handle(): int
    {
        $diskName = config('filesystems.upload_disk', 'r2');
        $cfg = config('filesystems.disks.'.$diskName);
        if (($cfg['driver'] ?? '') !== 's3' || empty($cfg['key'])) {
            $this->warn('Backup skipped: set R2/S3 env vars and RINGLINK_UPLOAD_DISK to an s3 disk.');

            return self::SUCCESS;
        }

        $db = (string) config('database.connections.mysql.database');
        $user = (string) config('database.connections.mysql.username');
        $pass = (string) config('database.connections.mysql.password');
        $host = (string) config('database.connections.mysql.host');
        $port = (string) config('database.connections.mysql.port', '3306');

        $tmp = storage_path('app/backup-'.uniqid('', true).'.sql.gz');
        $bash = sprintf(
            'mysqldump -h %s -P %s -u %s %s | gzip -c > %s',
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($user),
            escapeshellarg($db),
            escapeshellarg($tmp)
        );

        $result = Process::env(['MYSQL_PWD' => $pass])->timeout(600)->run(['bash', '-lc', $bash]);
        if (! $result->successful()) {
            $this->error('mysqldump failed: '.$result->errorOutput());

            return self::FAILURE;
        }

        $remote = (string) $this->option('path');
        $bytes = file_get_contents($tmp);
        Storage::disk($diskName)->put($remote, $bytes !== false ? $bytes : '');
        @unlink($tmp);
        $this->info('Uploaded backup to '.$diskName.' at '.$remote);

        return self::SUCCESS;
    }
}

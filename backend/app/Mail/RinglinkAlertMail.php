<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class RinglinkAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        public string $alertType,
        public array $payload,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'RingLink: '.$this->alertType,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.ringlink-alert',
            with: [
                'alertType' => $this->alertType,
                'payload' => $this->payload,
            ],
        );
    }
}

<?php

declare(strict_types=1);

namespace App\Enums;

enum SubmissionStatus: string
{
    case Submitted = 'submitted';
    case Reviewing = 'reviewing';
    case Interested = 'interested';
    case OfferSent = 'offer_sent';
    case Accepted = 'accepted';
    case Declined = 'declined';
    case Booked = 'booked';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}

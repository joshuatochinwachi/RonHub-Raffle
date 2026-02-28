import { useState, useEffect } from 'react';
import { X, ScrollText, ChevronDown } from 'lucide-react';

const rules = [
    {
        num: 1,
        title: 'Eligibility',
        items: [
            'The raffle is open to anyone worldwide, subject to local laws and regulations.',
            'Participants must be 18 years or older to enter.',
            'By entering, participants agree to these rules in full.',
        ],
    },
    {
        num: 2,
        title: 'Raffle Tickets & Entries',
        items: [
            'Each raffle ticket purchased grants one (1) entry into the draw.',
            'There is no limit to the number of tickets a participant may hold.',
            'Holding more tickets increases the participant\'s chances of winning but does not guarantee a win.',
        ],
    },
    {
        num: 3,
        title: 'Ticket Pricing',
        items: [
            'Each raffle ticket costs $2 USDC.',
            'Ticket purchases are final and non-refundable, except where required by law.',
        ],
    },
    {
        num: 4,
        title: 'Prize Details',
        items: [
            'The raffle prize is a PSA-graded Pokémon slab.',
            'The estimated market value of the prize is listed at its lowest observed price of $16,000 USD, with some market listings reaching up to $22,000 USD.',
            'Market values may fluctuate, and no fixed value is guaranteed at the time of drawing.',
        ],
    },
    {
        num: 5,
        title: 'Raffle Duration & Closing Conditions',
        items: [
            'The raffle begins with a 36-day countdown.',
        ],
        nestedGroup: {
            parent: 'The raffle will close when either of the following conditions is met, whichever occurs first:',
            children: [
                'The full 36-day period expires, or',
                '10,000 raffle tickets are sold.',
            ],
        },
        trailingItems: [
            'Once closed, no further ticket purchases will be accepted.',
        ],
    },
    {
        num: 6,
        title: 'Winner Selection & Announcement',
        items: [
            'The winner will be selected via a randomized draw conducted in a fair and transparent manner.',
            'The draw will take place within five (5) days after the raffle has officially closed.',
            'The winner will be announced through official KTTY World communication channels.',
        ],
    },
    {
        num: 7,
        title: 'Prize Claim Options',
        intro: 'The selected winner may choose one of the following options:',
        subSections: [
            {
                label: 'Physical Delivery:',
                items: [
                    'Receive the PSA slab shipped to their provided residential address.',
                    'Shipping, handling, and insurance will be covered by the project.',
                ],
            },
            {
                label: 'Buyback Option:',
                items: [
                    'Sell the prize back to the project for 80% of the prevailing market price at the time of settlement.',
                    'Payment will be made in USDT/USDC to the wallet address provided by the winner.',
                ],
            },
        ],
    },
    {
        num: 8,
        title: 'Use of Raffle Funds',
        items: [
            'All funds raised from the raffle will be allocated directly to the KTTY World ecosystem.',
            'These funds will be used to reward community members, support development, and fund future ecosystem initiatives.',
        ],
    },
    {
        num: 9,
        title: 'Verification & Compliance',
        items: [
            'The winner may be required to complete a basic verification process to confirm eligibility and prevent fraud.',
            'Failure to respond or complete verification within a reasonable timeframe may result in forfeiture of the prize and a redraw.',
        ],
    },
    {
        num: 10,
        title: 'Transparency & Fair Play',
        items: [
            'The project reserves the right to disqualify any entries found to be fraudulent, automated, or in violation of these rules.',
            'Any attempt to exploit, manipulate, or abuse the raffle system will result in immediate disqualification.',
        ],
    },
    {
        num: 11,
        title: 'Modifications & Final Authority',
        items: [
            'KTTY World reserves the right to modify, suspend, or cancel the raffle if unforeseen circumstances arise.',
            'All decisions made by the project team regarding the raffle are final.',
        ],
    },
    {
        num: 12,
        title: 'Minimum Ticket Threshold',
        items: [
            'A minimum of 5,000 raffle tickets must be sold for the raffle to proceed.',
            'If fewer than 5,000 tickets are sold by the time the raffle closes, the raffle will be cancelled.',
            'In the event of cancellation due to insufficient ticket sales, all participants will receive a full refund to the original payment method or wallet used.',
            'No winner will be drawn if the minimum threshold is not met.',
        ],
    },
    {
        num: 13,
        title: 'Disclaimer',
        items: [
            'This raffle is conducted for entertainment and community engagement purposes only.',
            'Participants are responsible for ensuring their participation complies with local laws.',
        ],
    },
];

export default function RaffleRules({ inline = false }) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(null);

    const toggle = (num) => setExpanded(prev => prev === num ? null : num);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            {/* Trigger Button — two variants */}
            {inline ? (
                <button
                    onClick={() => setOpen(true)}
                    className="text-[9px] md:text-[10px] text-ronhub-light-blue/70 hover:text-ronhub-light-blue font-bold underline underline-offset-2 transition-colors duration-200"
                >
                    Official Rules & Terms
                </button>
            ) : (
                <button
                    onClick={() => setOpen(true)}
                    className="group inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-all duration-300 text-[10px] md:text-xs font-bold uppercase tracking-widest"
                >
                    <ScrollText className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:text-ronhub-light-blue transition-colors duration-300" />
                    <span>Official Raffle Rules & Terms</span>
                </button>
            )}

            {/* Modal Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
                >
                    {/* Backdrop — near-opaque to fully conceal the page behind */}
                    <div
                        className="absolute inset-0 backdrop-blur-sm"
                        style={{ background: 'rgba(2, 4, 12, 0.96)' }}
                        onClick={() => setOpen(false)}
                    />

                    {/* Modal Panel */}
                    <div className="relative w-full md:max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl md:rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(29,78,216,0.15),0_25px_60px_rgba(0,0,0,0.7)]"
                        style={{
                            background: 'linear-gradient(175deg, #0e1830 0%, #080c1a 40%, #030510 100%)',
                            border: '1px solid rgba(96, 165, 250, 0.12)',
                        }}>

                        {/* Inner Glow Layer — top blue ambient */}
                        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none z-0"
                            style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(29,78,216,0.25) 0%, transparent 70%)' }}
                        />

                        {/* Header */}
                        <div className="relative z-10 flex items-center justify-between p-6 md:p-8 border-b border-white/5 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-ronhub-blue/20 border border-ronhub-blue/30">
                                    <ScrollText className="w-4 h-4 text-ronhub-light-blue" />
                                </div>
                                <div>
                                    <h2 className="text-sm md:text-base font-black text-white uppercase tracking-wider leading-none">
                                        🎟️ Official Raffle Rules & Terms
                                    </h2>
                                    <p className="text-[9px] md:text-[10px] text-white/40 font-medium mt-0.5 uppercase tracking-widest">13 Sections</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                            >
                                <X className="w-4 h-4 text-white/60" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="relative z-10 flex-1 overflow-y-auto p-5 md:p-8 space-y-3 scrollbar-thin">
                            {rules.map((rule) => (
                                <div
                                    key={rule.num}
                                    className="rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
                                    style={{ background: 'rgba(255,255,255,0.02)' }}
                                >
                                    {/* Section Header (Accordion Trigger) */}
                                    <button
                                        className="w-full flex items-center justify-between p-4 md:p-5 text-left group"
                                        onClick={() => toggle(rule.num)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black text-ronhub-light-blue border border-ronhub-blue/40 bg-ronhub-blue/10 flex-shrink-0">
                                                {rule.num}
                                            </span>
                                            <span className="text-xs md:text-sm font-bold text-white/90 group-hover:text-white transition-colors duration-200">
                                                {rule.title}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-300 ${expanded === rule.num ? 'rotate-180 text-ronhub-light-blue' : ''}`}
                                        />
                                    </button>

                                    {/* Expanded Content */}
                                    {expanded === rule.num && (
                                        <div className="px-4 pb-5 md:px-5 md:pb-6 space-y-3 border-t border-white/5 pt-4 text-left">
                                            {rule.intro && (
                                                <p className="text-xs md:text-sm text-white/60 leading-relaxed">{rule.intro}</p>
                                            )}
                                            {rule.items && (
                                                <ul className="space-y-2">
                                                    {rule.items.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-white/60 leading-relaxed text-left">
                                                            <span className="w-1 h-1 rounded-full bg-ronhub-light-blue/60 flex-shrink-0 mt-2" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {rule.nestedGroup && (
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="w-1 h-1 rounded-full bg-ronhub-light-blue/60 flex-shrink-0 mt-2" />
                                                        <span className="text-xs md:text-sm text-white/60 leading-relaxed">{rule.nestedGroup.parent}</span>
                                                    </div>
                                                    <ul className="ml-4 pl-3 border-l border-white/10 space-y-2">
                                                        {rule.nestedGroup.children.map((child, i) => (
                                                            <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-white/50 leading-relaxed text-left">
                                                                <span className="w-1 h-1 rounded-full bg-white/25 flex-shrink-0 mt-2" />
                                                                {child}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {rule.trailingItems && (
                                                <ul className="space-y-2">
                                                    {rule.trailingItems.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-white/60 leading-relaxed text-left">
                                                            <span className="w-1 h-1 rounded-full bg-ronhub-light-blue/60 flex-shrink-0 mt-2" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {rule.subSections && rule.subSections.map((sub, si) => (
                                                <div key={si} className="mt-3 pl-4 border-l border-ronhub-blue/20 space-y-2">
                                                    <p className="text-[10px] md:text-xs font-black text-white/80 uppercase tracking-wider text-left">{sub.label}</p>
                                                    <ul className="space-y-2">
                                                        {sub.items.map((item, i) => (
                                                            <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-white/60 leading-relaxed text-left">
                                                                <span className="w-1 h-1 rounded-full bg-ronhub-light-blue/40 flex-shrink-0 mt-2" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="relative z-10 flex-shrink-0 px-5 py-4 md:px-8 md:py-5 border-t border-white/5 text-center">
                            <p className="text-[9px] md:text-[10px] text-white/25 uppercase tracking-widest font-bold">
                                By purchasing a ticket, you agree to these official rules in full.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

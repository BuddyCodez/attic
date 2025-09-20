import { prisma } from '../src/lib/prisma';
import { BookStatus, PublishStatus, ContentType } from '@prisma/client';

async function main() {
    console.log('🌱 Starting database seed...');

    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.essayTag.deleteMany({});
    await prisma.bookTag.deleteMany({});
    await prisma.quoteTag.deleteMany({});
    await prisma.noteTag.deleteMany({});
    await prisma.collectionTag.deleteMany({});
    await prisma.collectionItem.deleteMany({});
    await prisma.quote.deleteMany({});
    await prisma.essay.deleteMany({});
    await prisma.book.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.collection.deleteMany({});
    await prisma.tag.deleteMany({});

    // Create Tags
    console.log('📚 Creating tags...');
    const tags = await Promise.all([
        prisma.tag.create({
            data: {
                name: 'Philosophy',
                slug: 'philosophy',
                color: '#8B5CF6',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Literature',
                slug: 'literature',
                color: '#F59E0B',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Psychology',
                slug: 'psychology',
                color: '#EF4444',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Comics',
                slug: 'comics',
                color: '#3B82F6',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Self-Improvement',
                slug: 'self-improvement',
                color: '#F97316',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Fiction',
                slug: 'fiction',
                color: '#EC4899',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Non-Fiction',
                slug: 'non-fiction',
                color: '#14B8A6',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Wisdom',
                slug: 'wisdom',
                color: '#8B5CF6',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Introversion',
                slug: 'introversion',
                color: '#10B981',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Trust',
                slug: 'trust',
                color: '#EF4444',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Personal Growth',
                slug: 'personal-growth',
                color: '#8B5CF6',
            },
        }),
    ]);

    // Create Essays
    console.log('✍️ Creating essays...');
    const essays = await Promise.all([
        prisma.essay.create({
            data: {
                slug: 'the-solitude-paradox',
                title: 'The Solitude Paradox',
                subtitle: 'Finding strength in being alone without feeling lonely',
                content: `# The Solitude Paradox

In a world that celebrates extroversion and constant connection, choosing solitude often feels like a radical act. Yet, there's a profound difference between loneliness and solitude—one depletes us, while the other replenishes.

## The Art of Being Alone

Solitude isn't about isolation; it's about intentional space. It's the quiet room where our thoughts can finally breathe, where we can hear our own voice above the noise of expectations and social obligations.

As someone who values this space deeply, I've found that my most creative ideas and clearest insights emerge not in crowded rooms, but in quiet moments of reflection.

## The Digital Dilemma

Our always-connected world makes true solitude increasingly rare. The constant ping of notifications, the pressure to respond immediately, the endless scroll—it all conspires against the quiet we need to truly know ourselves.

Learning to disconnect has become an essential skill for maintaining mental clarity and emotional balance.

## Finding Balance

The challenge isn't to retreat completely, but to find the right balance between connection and solitude. To be present with others when we choose to connect, and fully present with ourselves when we choose to be alone.

## Conclusion

Solitude is where we meet ourselves without masks or performances. It's where we discover what we truly think, feel, and believe—away from the influence of others. In embracing alone time, we don't lose connection with the world; we deepen our connection with ourselves, which ultimately allows for more authentic connections with others.`,
                excerpt: 'Exploring the difference between loneliness and intentional solitude, and why creating space for ourselves is essential for mental clarity and creativity.',
                readTime: 7,
                status: PublishStatus.PUBLISHED,
                publishedAt: new Date('2024-01-20'),
            },
        }),
        prisma.essay.create({
            data: {
                slug: 'rebuilding-trust-after-betrayal',
                title: 'Rebuilding Trust After Betrayal',
                subtitle: 'Navigating the painful journey from deception to cautious hope',
                content: `# Rebuilding Trust After Betrayal

Trust is fragile—built slowly over time but shattered in an instant. When someone we trust lies to us, it doesn't just break our confidence in them; it can shake our faith in our own judgment.

## The Anatomy of a Lie

A lie isn't just false information; it's a breach of the implicit contract between people. It says: "Your right to truth matters less than my convenience." The bigger the lie, the deeper the wound.

Recently, I've been grappling with this reality. The discovery of deception creates a peculiar form of grief—you mourn not just the trust that was broken, but the person you thought existed.

## The Aftermath

In the wake of betrayal, everything feels uncertain. You question past interactions, wonder what was real and what was performance. The ground beneath your feet feels unstable.

This is where the hard work begins: deciding whether to rebuild or walk away, and learning to trust yourself again regardless of the outcome.

## Learning to Trust Again

Rebuilding trust isn't about forgetting; it's about integrating the lesson while remaining open. It's about setting better boundaries, listening to intuition, and understanding that trust is earned, not given.

Most importantly, it's about remembering that one person's dishonesty doesn't define everyone's character.

## Moving Forward

Healing from betrayal is a journey that requires patience with yourself. Some days will be better than others. The goal isn't to return to who you were before, but to become someone wiser, stronger, and more discerning about where you place your trust.`,
                excerpt: 'A personal reflection on dealing with betrayal, rebuilding self-trust, and learning to navigate relationships with healthier boundaries.',
                readTime: 6,
                status: PublishStatus.PUBLISHED,
                publishedAt: new Date('2024-02-15'),
            },
        }),
        prisma.essay.create({
            data: {
                slug: 'why-batman-resonates',
                title: 'Why Batman Resonates With the Introverted Mind',
                subtitle: 'The appeal of the Dark Knight for those who prefer solitude',
                content: `# Why Batman Resonates With the Introverted Mind

Among the pantheon of superheroes, Batman stands apart. He doesn't have superpowers; he has discipline, intelligence, and a profound understanding of darkness. For introverts and those who value solitude, his story holds particular resonance.

## The Power of Preparation

Batman's greatest strength isn't physical—it's his meticulous preparation. He studies, plans, and trains relentlessly. This appeals to those of us who prefer thinking things through before acting, who find comfort in preparation rather than impulsivity.

## Embracing the Shadows

Unlike flashy superheroes who crave the spotlight, Batman operates from the shadows. He doesn't need validation or applause; his satisfaction comes from doing what's right, regardless of recognition.

This quiet competence speaks to those who prefer working behind the scenes, who find meaning in the work itself rather than the attention it might bring.

## The Burden and Beauty of Solitude

Bruce Wayne's journey is one of turning profound loneliness into strength. He doesn't try to fit into society's expectations; he creates his own path, on his own terms.

For those who've often felt like outsiders, Batman represents the possibility that our differences—our preference for solitude, our comfort with darkness—can become sources of strength rather than weaknesses.

## Conclusion

Batman reminds us that heroes come in many forms. Sometimes the strongest among us are those who've learned to sit with their pain, who've turned isolation into insight, and who fight their battles not for glory, but because it's the right thing to do.`,
                excerpt: 'Exploring why Batman\'s character resonates deeply with introverts and those who find strength in solitude and preparation.',
                readTime: 5,
                status: PublishStatus.PUBLISHED,
                publishedAt: new Date('2024-03-10'),
            },
        }),
    ]);

    // Create Books
    console.log('📖 Creating books...');
    const books = await Promise.all([
        prisma.book.create({
            data: {
                title: 'Wuthering Heights',
                author: 'Emily Brontë',
                isbn: '9780141439556',
                description: 'A wild, passionate story of the intense and almost demonic love between Catherine Earnshaw and Heathcliff.',
                pages: 416,
                publishedYear: 1847,
                status: BookStatus.READ,
                progress: 100,
                rating: 5,
                startedAt: new Date('2024-01-05'),
                finishedAt: new Date('2024-01-25'),
                notes: 'A masterpiece of Gothic literature. The raw, untamed passion and dark emotional intensity resonated deeply. Heathcliff\'s destructive love and the moorland setting create an atmosphere that stays with you long after reading. The themes of social class, revenge, and doomed love feel surprisingly modern.',
                highlights: [
                    {
                        text: "He's more myself than I am. Whatever our souls are made of, his and mine are the same.",
                        page: 82,
                        note: "Catherine's famous declaration - speaks to the intensity of soul connections"
                    },
                    {
                        text: "I have not broken your heart - you have broken it; and in breaking it, you have broken mine.",
                        page: 158,
                        note: "The tragic interdependence of their relationship"
                    },
                    {
                        text: "If all else perished, and he remained, I should still continue to be.",
                        page: 203,
                        note: "The depth of identification between them"
                    }
                ],
            },
        }),
        prisma.book.create({
            data: {
                title: 'The Art of Being Alone',
                author: 'Renuka Gavrani',
                isbn: '9789390997343',
                description: 'A guide to enjoying your own company and transforming loneliness into productive solitude.',
                pages: 192,
                publishedYear: 2021,
                status: BookStatus.READ,
                progress: 100,
                rating: 4,
                startedAt: new Date('2024-02-01'),
                finishedAt: new Date('2024-02-10'),
                notes: 'Found this at the perfect time. Validates the choice to spend quality time alone without seeing it as antisocial. Helpful distinction between loneliness (negative) and solitude (positive). Good practical advice for introverts navigating an extroverted world.',
                highlights: [
                    {
                        text: "Loneliness is the pain of being alone. Solitude is the joy of being alone.",
                        page: 27,
                        note: "The crucial distinction"
                    },
                    {
                        text: "Your relationship with yourself sets the tone for every other relationship you have.",
                        page: 63,
                        note: "Why self-awareness matters"
                    },
                    {
                        text: "In silence, we don't find emptiness; we find ourselves.",
                        page: 112,
                        note: "The value of quiet reflection"
                    }
                ],
            },
        }),
        prisma.book.create({
            data: {
                title: 'Batman: Year One',
                author: 'Frank Miller',
                isbn: '9781401233420',
                description: 'The definitive origin story of Batman that revolutionized the character and the comic book industry.',
                pages: 144,
                publishedYear: 1987,
                status: BookStatus.CURRENTLY_READING,
                progress: 75,
                rating: null,
                startedAt: new Date('2024-03-01'),
                notes: 'Frank Miller\'s gritty, realistic take on Batman\'s beginnings. Amazing how he humanizes Bruce Wayne while making him more formidable. The artwork is stunning—moody and atmospheric. Currently at the part where Gordon is starting to respect this mysterious vigilante.',
                highlights: [
                    {
                        text: "I shall become a bat.",
                        page: 32,
                        note: "The moment of inspiration - simple yet powerful"
                    },
                    {
                        text: "The rain on my chest is a baptism. I'm born again.",
                        page: 45,
                        note: "Bruce's transformation into something more"
                    },
                    {
                        text: "We can finally start to do some real good.",
                        page: 89,
                        note: "Gordon realizing Batman might be an ally"
                    }
                ],
            },
        }),
        prisma.book.create({
            data: {
                title: 'All-Star Superman',
                author: 'Grant Morrison',
                isbn: '9781401232119',
                description: 'A celebration of everything that makes Superman the greatest superhero of all time.',
                pages: 160,
                publishedYear: 2011,
                status: BookStatus.READ,
                progress: 100,
                rating: 5,
                startedAt: new Date('2024-02-15'),
                finishedAt: new Date('2024-02-20'),
                notes: "What an incredible love letter to Superman. Morrison understands that Superman's greatness isn't about his powers, but about his compassion and humanity.The scene where he saves a suicidal girl is one of the most powerful moments in comics.Made me appreciate the hope and inspiration Superman represents.",
                highlights: [
                    {
                        text: "You're much stronger than you think you are. Trust me.",
                        page: 56,
                        note: "Superman to the suicidal girl - heartbreaking and hopeful"
                    },
                    {
                        text: "Everything you've ever loved, everything you've ever been... It's all still there.",
                        page: 78,
                        note: "The reassurance of continuity and meaning"
                    },
                    {
                        text: "You've got a million chances. That's all you need.",
                        page: 122,
                        note: "The optimism that defines Superman"
                    }
                ],
            },
        }),
    ]);

    // Create Quotes
    console.log('💭 Creating quotes...');
    const quotes = await Promise.all([
        prisma.quote.create({
            data: {
                content: 'Whatever our souls are made of, his and mine are the same.',
                author: 'Emily Brontë',
                source: 'Wuthering Heights',
                context: 'Catherine Earnshaw describing her connection to Heathcliff. Captures the intense, almost supernatural bond between them.',
                page: 82,
                bookId: books[0].id,
            },
        }),
        prisma.quote.create({
            data: {
                content: 'Loneliness is the pain of being alone. Solitude is the joy of being alone.',
                author: 'Renuka Gavrani',
                source: 'The Art of Being Alone',
                context: 'The crucial distinction between negative loneliness and positive solitude. Helped me reframe my relationship with alone time.',
                page: 27,
                bookId: books[1].id,
            },
        }),
        prisma.quote.create({
            data: {
                content: "It's not who I am underneath, but what I do that defines me.",
                author: 'Batman',
                source: 'Batman Begins',
                context: 'From the movie, but perfectly captures Batman\'s philosophy. Actions matter more than intentions or identity.',
            },
        }),
        prisma.quote.create({
            data: {
                content: "You're much stronger than you think you are. Trust me.",
                author: 'Superman',
                source: 'All-Star Superman',
                context: "Superman saving a suicidal girl. Shows that his greatest power isn't strength, but compassion and hope.",
                page: 56,
                bookId: books[3].id,
            },
        }),
        prisma.quote.create({
            data: {
                content: 'Trust takes years to build, seconds to break, and forever to repair.',
                author: 'Unknown',
                source: 'Unknown',
                context: 'Something I keep coming back to after recent experiences. The fragility of trust feels particularly relevant right now.',
            },
        }),
        prisma.quote.create({
            data: {
                content: 'The strongest people are not those who show strength in front of us but those who win battles we know nothing about.',
                author: 'Unknown',
                source: 'Unknown',
                context: 'A reminder that everyone is fighting hidden battles. Helps me practice more compassion.',
            },
        }),
        prisma.quote.create({
            data: {
                content: 'In silence, we don\'t find emptiness; we find ourselves.',
                author: 'Renuka Gavrani',
                source: 'The Art of Being Alone',
                context: 'Why solitude can be so revealing and transformative.',
                page: 112,
                bookId: books[1].id,
            },
        }),
    ]);

    // Create Notes
    console.log('📝 Creating notes...');
    const notes = await Promise.all([
        prisma.note.create({
            data: {
                title: 'On Trust and Betrayal',
                content: `# Thoughts on Trust

**Date:** March 2024
**Status:** Processing recent experiences

## What I'm Learning:

Trust is like a mirror - once broken, you can piece it back together, but the cracks will always be visible.

The most painful betrayals aren't from enemies, but from those we thought were safe.

## Questions I'm Sitting With:
- How do you rebuild trust without being naive?
- When is forgiveness wise, and when is it self-betrayal?
- How do you distinguish between a genuine mistake and a pattern of deception?

## Personal Resolutions:
1. Trust my intuition more - it usually knows before my mind catches up
2. Set clearer boundaries from the beginning
3. Remember that someone's betrayal says more about them than about me
4. Allow time to reveal character rather than assuming good intentions

## A Hard Truth:
Not everyone deserves access to the most vulnerable parts of me. Learning to discern who earns that privilege is part of growing up.`,
                status: PublishStatus.DRAFT,
            },
        }),
        prisma.note.create({
            data: {
                title: 'Why I Relate to Batman',
                content: `# Batman as an Introvert Icon

## Shared Traits:
- Values preparation over impulsivity
- Comfortable operating in the background
- Turns pain into purpose rather than victimhood
- Doesn't need external validation to do what's right
- Finds strength in solitude rather than fearing it

## Key Differences (Thankfully):
- My parents are alive and well
- I haven't dedicated my life to fighting crime
- My "batcave" is just my apartment with too many books

## Why It Matters:
Seeing these qualities portrayed as strengths in a hero helps validate my natural inclinations. You don't have to be loud, social, or attention-seeking to be effective.

Sometimes the quietest people are observing the most, preparing the hardest, and making the biggest impact when it counts.`,
                status: PublishStatus.PUBLISHED,
            },
        }),
        prisma.note.create({
            data: {
                title: 'Solitude Practices That Work For Me',
                content: `# Intentional Alone Time

## Morning Quiet:
- First hour of the day: no phone, no internet
- Just tea, journaling, and planning the day
- Sets a calm tone for everything that follows

## Reading Evenings:
- 2-3 nights a week dedicated to deep reading
- Physical books only - no screens
- Sometimes with ambient music, often in silence

## Walking Alone:
- No podcasts, no music - just walking and thinking
- Lets my mind wander and make connections
- Surprisingly creative problem-solving time

## Digital Boundaries:
- No social media on phone
- Scheduled email checking (not constant)
- Learning to be bored without reaching for devices

## Why This Matters:
These practices help me stay centered in a noisy world. They're not about avoiding people, but about ensuring I have enough space to hear myself think.`,
                status: PublishStatus.PUBLISHED,
            },
        }),
        prisma.note.create({
            data: {
                content: `Quick thought: Wuthering Heights feels like visiting a haunted house where the ghosts are emotions too intense to fade away. There's something comforting about reading about passions wilder than anything I'll ever experience, from the safety of my quiet life.

Heathcliff and Catherine's love destroys them and everyone around them, but there's a terrible beauty in something that fierce, that all-consuming. Maybe we need these extreme stories to make sense of our more moderate emotions.`,
                status: PublishStatus.PUBLISHED,
            },
        }),
    ]);

    // Create Collections
    console.log('🗂️ Creating collections...');
  /*
    const collections = await Promise.all([
        prisma.collection.create({
            name
            description: 'Essays, books, and quotes about the value of alone time and inner strength',
            isPublic: true,
        }),
        prisma.collection.create({
            name: 'Comics That Made Me Think',
            description: 'Graphic novels and comics that offered surprising depth and insight',
            isPublic: true,
        }),
        prisma.collection.create({
            name: 'Trust & Relationships',
            description: 'Resources for understanding trust, betrayal, and healthy boundaries',
            isPublic: false, // Keeping this private for now
        }),
        prisma.collection.create({
            name: 'Gothic Literature Favorites',
            description: 'Dark, atmospheric stories that explore intense emotions and complex characters',
            isPublic: true,
        }),
    ]);
    */

    // Create Collection Items
    // console.log('🔗 Creating collection items...');
    // await Promise.all([
    //     // Solitude Collection
    //     prisma.collectionItem.create({
    //         collectionId: collections[0].id,
    //         contentType: ContentType.BOOK,
    //         contentId: books[1].id, // The Art of Being Alone
    //         order: 1,
    //         note: 'The book that helped me reframe solitude as a positive choice rather than a social failure.',
    //     }),
    //     prisma.collectionItem.create({
    //         collectionId: collections[0].id,
    //         contentType: ContentType.ESSAY,
    //         contentId: essays[0].id, // The Solitude Paradox
    //         order: 2,
    //         note: 'My personal reflections on finding strength in alone time.',
    //     }),
    //     prisma.collectionItem.create({
    //         collectionId: collections[0].id,
    //         contentType: ContentType.QUOTE,
    //         contentId: quotes[1].id, // Loneliness vs Solitude quote
    //         order: 3,
    //         note: 'The distinction that changed everything for me.',
    //     }),

    //     // Comics Collection
    //     prisma.collectionItem.create({
    //         collectionId: collections[1].id,
    //         contentType: ContentType.BOOK,
    //         contentId: books[2].id, // Batman: Year One
    //         order: 1,
    //         note: 'The definitive Batman origin story - gritty and human.',
    //     }),
    //     prisma.collectionItem.create({
    //         collectionId: collections[1].id,
    //         contentType: ContentType.BOOK,
    //         contentId: books[3].id, // All-Star Superman
    //         order: 2,
    //         note: 'Superman at his most compassionate and inspiring.',
    //     }),
    //     prisma.collectionItem.create({
    //         collectionId: collections[1].id,
    //         contentType: ContentType.ESSAY,
    //         contentId: essays[2].id, // Why Batman Resonates
    //         order: 3,
    //         note: 'Exploring why Batman appeals to introverts and solitary thinkers.',
    //     }),

    //     // Trust Collection (Private)
    //     prisma.collectionItem.create({
    //         collectionId: collections[2].id,
    //         contentType: ContentType.ESSAY,
    //         contentId: essays[1].id, // Rebuilding Trust essay
    //         order: 1,
    //         note: 'Personal reflections on dealing with betrayal.',
    //     }),
    //     prisma.collectionItem.create({
    //         collectionId: collections[2].id,
    //         contentType: ContentType.NOTE,
    //         contentId: notes[0].id, // On Trust and Betrayal note
    //         order: 2,
    //         note: 'Raw thoughts and questions I\'m working through.',
    //     }),

    //     // Gothic Literature Collection
    //     prisma.collectionItem.create({
    //         collectionId: collections[3].id,
    //         contentType: ContentType.BOOK,
    //         contentId: books[0].id, // Wuthering Heights
    //         order: 1,
    //         note: 'The ultimate Gothic romance - wild, passionate, and destructive.',
    //     }),
    // ]);

    // Create Tag relationships
    console.log('🏷️ Creating tag relationships...');

    // Essay tags
    await Promise.all([
        prisma.essayTag.create({
            data: { essayId: essays[0].id, tagId: tags[8].id }, // Solitude -> Introversion
        }),
        prisma.essayTag.create({
            data: { essayId: essays[0].id, tagId: tags[10].id }, // Solitude -> Personal Growth
        }),
        prisma.essayTag.create({
            data: { essayId: essays[1].id, tagId: tags[9].id }, // Trust -> Trust
        }),
        prisma.essayTag.create({
            data: { essayId: essays[1].id, tagId: tags[2].id }, // Trust -> Psychology
        }),
        prisma.essayTag.create({
            data: { essayId: essays[2].id, tagId: tags[3].id }, // Batman -> Comics
        }),
        prisma.essayTag.create({
            data: { essayId: essays[2].id, tagId: tags[8].id }, // Batman -> Introversion
        }),
    ]);

    // Book tags
    await Promise.all([
        prisma.bookTag.create({
            data: { bookId: books[0].id, tagId: tags[1].id }, // Wuthering Heights -> Literature
        }),
        prisma.bookTag.create({
            data: { bookId: books[0].id, tagId: tags[5].id }, // Wuthering Heights -> Fiction
        }),
        prisma.bookTag.create({
            data: { bookId: books[1].id, tagId: tags[4].id }, // Art of Being Alone -> Self-Improvement
        }),
        prisma.bookTag.create({
            data: { bookId: books[1].id, tagId: tags[8].id }, // Art of Being Alone -> Introversion
        }),
        prisma.bookTag.create({
            data: { bookId: books[2].id, tagId: tags[3].id }, // Batman -> Comics
        }),
        prisma.bookTag.create({
            data: { bookId: books[2].id, tagId: tags[5].id }, // Batman -> Fiction
        }),
        prisma.bookTag.create({
            data: { bookId: books[3].id, tagId: tags[3].id }, // Superman -> Comics
        }),
        prisma.bookTag.create({
            data: { bookId: books[3].id, tagId: tags[5].id }, // Superman -> Fiction
        }),
    ]);

    // Quote tags
    await Promise.all([
        prisma.quoteTag.create({
            data: { quoteId: quotes[0].id, tagId: tags[1].id }, // Brontë -> Literature
        }),
        prisma.quoteTag.create({
            data: { quoteId: quotes[1].id, tagId: tags[8].id }, // Gavrani -> Introversion
        }),
        prisma.quoteTag.create({
            data: { quoteId: quotes[2].id, tagId: tags[3].id }, // Batman -> Comics
        }),
        prisma.quoteTag.create({
            data: { quoteId: quotes[3].id, tagId: tags[3].id }, // Superman -> Comics
        }),
        prisma.quoteTag.create({
            data: { quoteId: quotes[4].id, tagId: tags[9].id }, // Trust quote -> Trust
        }),
        prisma.quoteTag.create({
            data: { quoteId: quotes[6].id, tagId: tags[8].id }, // Gavrani silence -> Introversion
        }),
    ]);

    // Note tags
    await Promise.all([
        prisma.noteTag.create({
            data: { noteId: notes[0].id, tagId: tags[9].id }, // Trust note -> Trust
        }),
        prisma.noteTag.create({
            data: { noteId: notes[0].id, tagId: tags[2].id }, // Trust note -> Psychology
        }),
        prisma.noteTag.create({
            data: { noteId: notes[1].id, tagId: tags[3].id }, // Batman note -> Comics
        }),
        prisma.noteTag.create({
            data: { noteId: notes[1].id, tagId: tags[8].id }, // Batman note -> Introversion
        }),
        prisma.noteTag.create({
            data: { noteId: notes[2].id, tagId: tags[8].id }, // Solitude practices -> Introversion
        }),
        prisma.noteTag.create({
            data: { noteId: notes[3].id, tagId: tags[1].id }, // Wuthering Heights note -> Literature
        }),
    ]);

    // // Collection tags
    // await Promise.all([
    //     prisma.collectionTag.create({
    //         data: { collectionId: collections[0].id, tagId: tags[8].id }, // Solitude collection -> Introversion
    //     }),
    //     prisma.collectionTag.create({
    //         data: { collectionId: collections[1].id, tagId: tags[3].id }, // Comics collection -> Comics
    //     }),
    //     prisma.collectionTag.create({
    //         data: { collectionId: collections[2].id, tagId: tags[9].id }, // Trust collection -> Trust
    //     }),
    //     prisma.collectionTag.create({
    //         data: { collectionId: collections[3].id, tagId: tags[1].id }, // Gothic collection -> Literature
    //     }),
    // ]);

    console.log('✅ Seeding completed successfully!');

    // Print summary
    const counts = await Promise.all([
        prisma.tag.count(),
        prisma.essay.count(),
        prisma.book.count(),
        prisma.quote.count(),
        prisma.note.count(),
        prisma.collection.count(),
        prisma.collectionItem.count(),
    ]);

    console.log('\n📊 Database Summary:');
    console.log(`• Tags: ${counts[0]}`);
    console.log(`• Essays: ${counts[1]}`);
    console.log(`• Books: ${counts[2]}`);
    console.log(`• Quotes: ${counts[3]}`);
    console.log(`• Notes: ${counts[4]}`);
    console.log(`• Collections: ${counts[5]}`);
    console.log(`• Collection Items: ${counts[6]}`);
    console.log('\n🎉 Your digital attic now reflects your personal interests and journey!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
const Internship = require('../models/internship');
const internships = require('../data/internships');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Inserts the demo internship catalogue.
 * With `{ reset: true }` the catalogue is upserted and deadlines are refreshed.
 */
async function seedInternships({ reset = false } = {}) {
    if (!reset) {
        const count = await Internship.estimatedDocumentCount();
        if (count > 0) {
            return { seeded: false, count };
        }
    }

    const now = Date.now();
    const operations = internships.map(({ deadlineInDays, ...internship }) => ({
        updateOne: {
            filter: { slug: internship.slug },
            update: {
                $set: {
                    ...internship,
                    deadline: new Date(now + deadlineInDays * DAY_IN_MS),
                    isActive: true,
                },
            },
            upsert: true,
        },
    }));

    await Internship.bulkWrite(operations, { ordered: false });
    const count = await Internship.countDocuments();
    return { seeded: true, count };
}

module.exports = { seedInternships };

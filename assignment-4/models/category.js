const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true });

CategorySchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

CategorySchema.statics.parseListParam = function parseListParam(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item || '').split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

CategorySchema.statics.findByNamesOrSlugs = function findByNamesOrSlugs(names, slugs) {
  const or = [];

  if (Array.isArray(names) && names.length) {
    or.push({ name: { $in: names } });
  }

  if (Array.isArray(slugs) && slugs.length) {
    or.push({ slug: { $in: slugs } });
  }

  if (!or.length) {
    return this.find({}).sort({ name: 1 });
  }

  return this.find({ $or: or }).sort({ name: 1 });
};

module.exports = mongoose.model('Category', CategorySchema);
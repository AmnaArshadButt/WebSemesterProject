
const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({

  slug: { 
    type: String, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  price: {
     type: Number,
      required: true,
       min: 0 
      },
  category: { 
    type: String, 
    required: true, 
    trim: true 
  },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5 
  },
  stock: { 
    type: Number,
    default: 0, 
    min: 0 
  },
  image: { 
    type: String 
  },
  description: {
     type: String 
    },
  
}, {timestamps: true});

ProductSchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Product', ProductSchema);

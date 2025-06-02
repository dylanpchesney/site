module.exports = {
  files: 'contentful-config.js',
  from: [
    /CONTENTFUL_SPACE_ID/g,
    /CONTENTFUL_DELIVERY_TOKEN/g,
    /CONTENTFUL_PREVIEW_TOKEN/g
  ],
  to: [
    process.env.CONTENTFUL_SPACE_ID,
    process.env.CONTENTFUL_DELIVERY_TOKEN,
    process.env.CONTENTFUL_PREVIEW_TOKEN
  ]
}; 
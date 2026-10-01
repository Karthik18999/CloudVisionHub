const { DetectLabelsCommand, DetectTextCommand } = require('@aws-sdk/client-rekognition');
const { rekognitionClient, isMockMode } = require('./clients');
const mockAwsEngine = require('./mockAwsEngine');

async function analyzeImageVision(imageBuffer, fileName = '') {
  if (isMockMode) {
    return mockAwsEngine.detectRekognitionLabels(imageBuffer, fileName);
  }

  let labels = [];
  let detectedTexts = [];
  let category = 'General Photography';

  try {
    // 1. Detect Labels (Objects, Concepts, Categories)
    const labelCommand = new DetectLabelsCommand({
      Image: { Bytes: imageBuffer },
      MaxLabels: 10,
      MinConfidence: 70
    });

    const labelResult = await rekognitionClient.send(labelCommand);
    if (labelResult.Labels) {
      labels = labelResult.Labels.map((l) => ({
        Name: l.Name,
        Confidence: Number(l.Confidence.toFixed(1)),
        Categories: l.Categories ? l.Categories.map((c) => c.Name) : []
      }));
    }

    // Determine category based on detected AWS Rekognition labels & categories
    const labelNames = labels.map(l => l.Name.toLowerCase()).join(' ');
    const labelCategories = labels.flatMap(l => l.Categories || []).map(c => c.toLowerCase()).join(' ');
    const combinedStr = `${labelNames} ${labelCategories}`;

    if (/document|text|paper|invoice|receipt|page|font|letter|script/.test(combinedStr)) {
      category = 'Document & OCR';
    } else if (/person|face|human|portrait|people|man|woman|child|head|smile/.test(combinedStr)) {
      category = 'Facial & People';
    } else if (/nature|landscape|mountain|sky|tree|forest|plant|flower|sea|ocean|beach|outdoors/.test(combinedStr)) {
      category = 'Nature & Outdoor';
    } else if (/animal|dog|cat|pet|bird|wildlife|mammal|fauna|zoo/.test(combinedStr)) {
      category = 'Animals & Pets';
    } else if (/vehicle|car|automobile|transportation|truck|bus|motorcycle|bike|wheel/.test(combinedStr)) {
      category = 'Vehicles & Automotive';
    } else if (/food|meal|dish|cuisine|fruit|vegetable|beverage|drink|dining/.test(combinedStr)) {
      category = 'Food & Culinary';
    } else if (/electronics|computer|technology|laptop|phone|display|screen|hardware|device/.test(combinedStr)) {
      category = 'Electronics & Tech';
    } else if (/building|architecture|city|urban|house|structure|home|tower|office/.test(combinedStr)) {
      category = 'Architecture & Urban';
    } else if (labels.length > 0) {
      category = `${labels[0].Name} & Photo`;
    }

    // 2. Detect Text / OCR if applicable
    try {
      const textCommand = new DetectTextCommand({
        Image: { Bytes: imageBuffer }
      });
      const textResult = await rekognitionClient.send(textCommand);
      if (textResult.TextDetections) {
        detectedTexts = textResult.TextDetections.filter((t) => t.Type === 'LINE').map((t) => t.DetectedText);
      }
    } catch (err) {
      console.warn('[AWS Rekognition] Text detection skipped/failed:', err.message);
    }
  } catch (err) {
    console.error('[AWS Rekognition] Error detecting labels:', err);
    throw err;
  }

  return {
    labels,
    texts: detectedTexts,
    category
  };
}

module.exports = {
  analyzeImageVision
};

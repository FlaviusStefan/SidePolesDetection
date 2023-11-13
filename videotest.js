const Source_video = document.getElementById('video');
let canvas = document.getElementById('canvasOutput');

function startSource_Video() {
    Source_video.src = '08_SidePolesDetection.mp4';
    Source_video.play();
}

cv['onRuntimeInitialized'] = () => {
    let srcImage = new cv.Mat(Source_video.height, Source_video.width, cv.CV_8UC4);
    let cap = new cv.VideoCapture(Source_video);

    const FPS = 30;
    function processVideoAndDetectPoles() {
        console.log("works")
        let begin = Date.now();
        cap.read(srcImage);
    
        // Create a destination image
        let dstImage = new cv.Mat(srcImage.rows, srcImage.cols, srcImage.type());

        srcImage.copyTo(dstImage);
    
        // Call the function to detect poles
        detectPoles(srcImage, dstImage);
    
        cv.imshow(canvas, dstImage);
    
        // Calculate the delay for the next frame processing
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideoAndDetectPoles, delay);
    
        // Clean up
        dstImage.delete();
    }
    
    // Make sure to delete srcImage when you're completely done with it, such as when the video ends
    

    setTimeout(processVideoAndDetectPoles, 0); // Call the renamed function
};

startSource_Video();


// This function will be responsible for processing each frame to detect poles.
function detectPoles(srcImage, dstImage) {
  let gray = new cv.Mat();
  let blurred = new cv.Mat();
  let edges = new cv.Mat();
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  // Convert to grayscale
  cv.cvtColor(srcImage, gray, cv.COLOR_RGBA2GRAY, 0);

  // Optional: apply Gaussian blur to reduce noise
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 1.5, 1.5);

  // Detect edges
  cv.Canny(blurred, edges, 75, 150, 3, false);

  // Find contours
  cv.findContours(
    edges,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  // Draw rectangles around the detected poles
  for (let i = 0; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    let rect = cv.boundingRect(cnt);
    let aspectRatio = rect.width / rect.height;

    // Filter the contour by aspect ratio, area, width, and height
    if (
      aspectRatio > 0.2 &&
      aspectRatio < 4.0 &&
      rect.width > 10 &&
      rect.height > 40
    ) {
      // Assume poles are relatively thin and tall compared to their width
      // Draw the rectangle on the destination image
      let color = new cv.Scalar(255, 0, 0);
      cv.rectangle(
        dstImage,
        new cv.Point(rect.x, rect.y),
        new cv.Point(rect.x + rect.width, rect.y + rect.height),
        color,
        2
      );
    }
    console.log(`Detected a pole with aspectRatio: ${aspectRatio}, width: ${rect.width}, height: ${rect.height}`);
  }

  // Clean up
  gray.delete();
  blurred.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();
}

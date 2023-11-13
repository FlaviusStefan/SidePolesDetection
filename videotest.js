const Source_video = document.getElementById('video');
let canvas = document.getElementById('canvasOutput');

function startSource_Video() {
    Source_video.src = '08_SidePolesDetection.mp4';
    Source_video.play();
}

startSource_Video();

cv['onRuntimeInitialized'] = () => {
    let srcImage = new cv.Mat(Source_video.height, Source_video.width, cv.CV_8UC4);
    let cap = new cv.VideoCapture(Source_video);

    const FPS = 30;
    function processSource_Video() {
        let begin_delay = Date.now();
        cap.read(srcImage);
        cv.imshow(canvas, srcImage);
        let delay = 1000 / FPS - (Date.now() - begin_delay);
        setTimeout(processSource_Video, delay);
    };    
    setTimeout(processSource_Video, 0);
};
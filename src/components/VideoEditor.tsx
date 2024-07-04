import {ChangeEvent, useContext, useEffect, useRef} from "react";
import styled from "styled-components";

import TrimBar from "./TrimBar";
import {getFormatedTime} from "../utils";
import { IVideo, VideoContext } from "../context/VideoContext";
// Images
import PlayIcon from '../assets/play_icon.svg';
import PauseIcon from '../assets/pause_icon.svg';



//#region Style Definitions
const VideoElement = styled.div`
  display:flex;
  justify-content:center;
  width: 100vh;
`;
const VideoWindow = styled.div`
    display: flex;
    height: 70vh;
    width: 90%;
    flex-direction: column;
    background-color: black;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 20px;
`;
const VideoCtrl  = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-around;
`;

const VideoControl = styled.img`
    width:20px;
`;

const VideoLabel = styled.label`
    color: white;
`;

const VideoTag = styled.video`
  padding: 20px;
  height: 50vh;
  max-width: 90%;
`;
//#endregion

function VideoEditor(){

    //#region Properties
    const videoRef = useRef<HTMLVideoElement>(null);
    const {
        trimEnd,
         setVideoDuration, 
         setTrimEnd, 
         setShowTime,
         showTime,
         setTrimStart,
         setImagePath,
         isPaush: isPaush,
         setIsPaush,
        } = useContext(VideoContext) as IVideo;

        const trimEndRef = useRef(trimEnd);

    //#endregion

    //#region Lifecycle

    // Update the ref value whenever trimEnd changes
    useEffect(() => {
        trimEndRef.current = trimEnd;
    }, [trimEnd]);


    useEffect(() => {
        const videoElement:HTMLVideoElement | null = videoRef.current;
        if (videoElement) {
            const loadMetaData = function () {
                setVideoDuration(videoElement.duration);
                setTrimEnd(videoElement.duration);
                setShowTime(getFormatedTime(videoElement.currentTime) + "/" + getFormatedTime(videoElement.duration));

            }
            const timeUpdate = function () {
                setShowTime(getFormatedTime(videoElement.currentTime) + "/" + getFormatedTime(videoElement.duration));  
                if (videoElement.currentTime > trimEndRef.current) {
                    videoElement.pause();
                    setIsPaush(true);
                    
                }
            }
            videoElement.addEventListener("loadedmetadata", loadMetaData);
            videoElement.addEventListener("timeupdate", timeUpdate);
            return(()=>{
                videoElement.removeEventListener("loadedmetadata", loadMetaData);
                videoElement.removeEventListener("timeupdate", timeUpdate);
            })
        }
        
    }, []);
    //#endregion

    //#region Methods
    const updateTime = (value: number, startOrEnd: string) => {
        const video: HTMLVideoElement | null = videoRef.current;

        if (startOrEnd === 'start') {
            if (video && video.currentTime < value) {
                video.currentTime = value;
            }
            setTrimStart(value);
        } else {
            if (video && video.currentTime > value) {
                video.currentTime = value;
            }
            setTrimEnd(value);
        }
};
    
    const updateCurrentTime = (value:number) => {
        const video:HTMLVideoElement | null = videoRef.current;
        if (video){
            video.currentTime = value;
        }
    }

    // Function for creating a thumbnail images from video
    function captureVideoThumbnails(videoUrl:string, imageCount:number):Promise<string[]> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const thumbnails:string[] = [];
            let jumps = 0;
            video.addEventListener('loadedmetadata', () => {
                video.currentTime = 0;
                jumps = video.duration / imageCount ;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            });


            video.addEventListener('seeked', () => {
                // Create the thumbnail
                if (context) context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnail = canvas.toDataURL('image/jpeg');
                thumbnails.push(thumbnail);

                // Seek to the next interval or resolve the promise
                if (video.currentTime + jumps <= video.duration) {
                    video.currentTime += jumps;
                } else {
                    resolve(thumbnails);
                }
            });

            video.addEventListener('error', () => {
                reject("Error when loading video");
            });

            video.src = videoUrl;
            video.load();
        });
    }

    // load the video from file path
    const loadVideo = (e:ChangeEvent<HTMLInputElement>) =>{
        //setImagePath([]);
        const file = e.target.files;
        if (file && file.length) {
            const url = URL.createObjectURL(file[0]);
            const video: HTMLVideoElement | null = videoRef.current;
            if (video) {
                video.src = url;
                captureVideoThumbnails(url, 10).then(thumbnailsImages => {
                    // This is a base64 string of the first frame of the video.
                    // You can use this as the src attribute of an img element, save it to a server, etc.
                    setImagePath(thumbnailsImages);
                });
                setTrimStart(0);
              //  setTrimEnd(video.duration);
            }
        }
    }

    // handle the play video process.
    const playVideo = () => {
        const video:HTMLVideoElement | null = videoRef.current;
        if (video && !isPaush){
            video.pause();
        // in case the video is in the end of the time range, pause the video
        } else  if (video && video.currentTime < trimEnd) {
            video.play();
        }
        setIsPaush(!isPaush);

    }
    //#endregion

    return (
        
        <>
            <input type="file" onChange={loadVideo} accept="video/*" />
            <VideoElement> 
                <VideoWindow>
                    <VideoTag ref={videoRef} className="video" controls={false} />
                    <VideoCtrl>
                        <VideoControl alt='controller' src={isPaush ? PlayIcon : PauseIcon} onClick={playVideo}/>
                        <VideoLabel>{showTime}</VideoLabel>
                    </VideoCtrl>
                </VideoWindow>
            </VideoElement>
            <TrimBar
                setTrimStart={(value) => updateTime(value,'start')}
                setTrimEnd={(value) => updateTime(value,'end')}
                currentTime={videoRef.current != null ? videoRef.current.currentTime: 0}
                setCurrentTime={updateCurrentTime}
            />
        </>
    )
}

 export default VideoEditor;
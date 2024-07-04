import React, {useState, useEffect, useRef, useContext} from "react";
import styled from "styled-components";
// images
import TriangleIcon from '../assets/traingle-icon.svg';
import { IVideo, VideoContext } from "../context/VideoContext";


//#region Style Definitions
const TrimBarDiv = styled.div`
    position: relative;
    width: 100%;
    margin: auto;
`;

const SliderBackground = styled.div`
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    height: 80px;
    background: #000000;
`
const Slider = styled.div`
    width: 5px;
    height: 65px;
    border-radius: 10px 0 0 10px;
    background: #E2B425;
    cursor: ew-resize;
    z-index:1
`;

const SliderStart = styled(Slider)`
    border-radius: 10px 0 0 10px;
`;

const SliderEnd = styled(Slider)`
    border-radius: 0 10px 10px 0;
`;
const SliderEmpty = styled.div`
  height: 80px;
  background: black;
  opacity: 0.7;
  z-index:1 
`;

const SliderCenter = styled.div`
  height: 60px;
  border: 3px solid #E2B425;
  z-index:1 
`;

const VideoImages = styled.div`
    position: absolute;
    height: 80px;
    width: 99%;
    top: 10px;
    opacity: 0.8;
    z-index: 0;
    padding: 0px 5px;
`;
const VideoProgressCursor = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    height: 80px;
    width:100%;
    padding: 0px 5px;
`;
const VideoProgressCursorGroup = styled.div`
    display: flex;
    flex-direction: column;
`;
const VideoProgressCursorIcon = styled.img`
    position: relative;
    left: -6px;
    height: 15px;
    z-index: 5;
    cursor: pointer;
    transform: rotate(180deg);
`;
const VideoProgressCursorLine = styled.div`
    position: relative;
    width: 3px;
    height: 60px;
    background: white;
    cursor: pointer;
    z-index: 5;
`;

const TimeDisplay = styled.span`
    position: absolute;
    top: -30px;
    right: 0px;
    background-color: #E2B425;
    padding: 2px 5px;
    border-radius: 3px;
`;

//#endregion

function TrimBar( props: {
    currentTime: number,
    setTrimStart: (arg0: number) => void,
    setTrimEnd: (arg0: number) => void,
    setCurrentTime: (arg0: number) => void,
}){
    //#region Properties
    const videoProgressRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<string>('');
    const [initialDragPos, setInitialDragPos] = useState(0);
    const {
        videoDuration,
        trimStart,
        trimEnd,
        imagePath
    } = useContext(VideoContext) as IVideo;
    //#endregion

    //#region lifecycle
    useEffect(() => {
        const mouseMoveListener = (e: MouseEvent) => {
          e.stopPropagation();
          if (dragging) {
            updateTrim(e, dragging);
          }
        };
    
        const mouseUpListener = () => {
          setDragging('');
        };
    
        if (dragging) {
          window.addEventListener("mousemove", mouseMoveListener);
          window.addEventListener("mouseup", mouseUpListener);
    
          // Cleanup function to remove event listeners
          return () => {
            window.removeEventListener("mousemove", mouseMoveListener);
            window.removeEventListener("mouseup", mouseUpListener);
          };
        }
      }, [dragging]);

    //#endregion

    //#region Methods

    const getRelativePosition = (e:MouseEvent, element:HTMLDivElement) => {
        const rect = element.getBoundingClientRect();
        return e.clientX - rect.left;
    };

    const updateTrim = (e:MouseEvent, position:string) => {
        const videoProgress:HTMLDivElement | null = videoProgressRef.current;
        if (videoProgress) {
            const newTime =
                (getRelativePosition(e, videoProgress) / videoProgress.offsetWidth) *
                videoDuration;
            switch (position) {
                case 'start':
                    props.setTrimStart(newTime);
                    break;
                case 'end':
                    props.setTrimEnd(newTime);
                    break;
                case 'both':
                    // eslint-disable-next-line no-case-declarations
                    const offset = (e.clientX - initialDragPos) / window.innerWidth * videoDuration;
                    props.setTrimStart(trimStart + offset);
                    props.setTrimEnd(trimEnd + offset);
                    break;
                case 'cursor':
                    if (newTime < trimEnd && newTime > trimStart) {
                        props.setCurrentTime(newTime);
                    }
                    break;
                default:
                    break;
            }
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, type: React.SetStateAction<string>) => {
        setDragging(type);
        setInitialDragPos(e.clientX);
      };
    //#endregion

    return (
        <TrimBarDiv>
            <SliderBackground id="videoProgress" ref={videoProgressRef}>
                <SliderEmpty style={{width: `${(trimStart / videoDuration) * 99}%`}}></SliderEmpty>
                <SliderStart onMouseDown={(e) => handleMouseDown(e,"start")}/>
                <SliderCenter
                     style={{width: `${((trimEnd - trimStart) / videoDuration) * 100}%`}}
                     onMouseDown={(e) => handleMouseDown(e,"both")}
                >
                </SliderCenter>
                <SliderEnd  onMouseDown={(e) => handleMouseDown(e,"end")}/>
                <SliderEmpty
                     style={{width: `${((videoDuration - trimEnd) / videoDuration) * 100}%`}}
                ></SliderEmpty>
            </SliderBackground>
            <TimeDisplay>{(trimEnd - trimStart).toFixed(2)}</TimeDisplay>
            
            <VideoProgressCursor id="videoProgressCursor" >
                <div
                     style={{paddingRight: `${(props.currentTime/videoDuration)*98}%`}}>
                </div>
                <VideoProgressCursorGroup onMouseDown={(e) => handleMouseDown(e,"cursor")} >
                    <VideoProgressCursorIcon alt="timeLineController" src={TriangleIcon}/>
                    <VideoProgressCursorLine />
                </VideoProgressCursorGroup>
            </VideoProgressCursor>
            <VideoImages >
                {imagePath.map((imgUrl:string, index:number) =>{
                    return <img alt="videoImages" src={imgUrl} key={index} style={{width:`${100 / imagePath.length}%`, maxHeight: '60px', aspectRatio: 1/1}} draggable={false}/>
                })}
            </VideoImages>
        </TrimBarDiv>

    );
}

export default TrimBar;

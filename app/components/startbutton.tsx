import {useState,useEffect,useRef} from 'react'
import PropTypes from 'prop-types'


import classes from './startbutton.module.css'
import { constrainedMemory } from 'process'
import MicIcon from "../icons/mic.svg";
import MicOnIcon from "../icons/micon.svg";
import { ReadLang,getReadLang } from '../locales';

import {NextResponse } from "next/server";

//import {getLang} from '../locales'



export const startStates = {
    default: 'default',
    active: 'active',
}

interface StartButtonProps {
    disabled?: boolean;
    //isRecording?: boolean;
    state?: typeof startStates.default; // replace with the actual type
    onClick?: () => void; // this line is important
    //children?: ReactNode;
    handleUserinput:(data:string)=>void;
}

const StartButton: React.FC<StartButtonProps> = ({ disabled = false, state = startStates.default, onClick,handleUserinput}) => {
  
    const [permission, setPermission] = useState('denied');
    const mediaRef = useRef<MediaRecorder | null>(null);
     const [isRecording, setRecording] = useState(false)
    const chunksRef = useRef<Blob[]>([]);


    const startRef = useRef(startStates.default)
    const recordRef = useRef(false)

    const abortControllerRef = useRef<AbortController | null>(null);
    let dataPromise: Promise<Blob[]>;

    useEffect(() => {
        
        abortControllerRef.current = new AbortController()

        return () => {

            try {
                
                if(abortControllerRef.current) {
                    abortControllerRef.current.abort()
                }

            } catch(err) {
                console.log(err)
            }

        }

    }, [])
    const handleStream = (stream:MediaStream) => {
  
        try {
                
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          
                mediaRef.current = new MediaRecorder(stream, {
                    audioBitsPerSecond: 128000,
                    mimeType: 'audio/webm;codecs=opus',
                })
                console.log("MediaRecorder2 webm");

            }
            else if(MediaRecorder.isTypeSupported('audio/mp4;codecs=aac')){
                
                mediaRef.current = new MediaRecorder(stream, {
                    audioBitsPerSecond: 128000,
                    mimeType: 'audio/mp4;codecs=aac',
                })
                console.log("MediaRecorder3 mp4");
            }
            else{
                mediaRef.current = new MediaRecorder(stream, {
                    audioBitsPerSecond: 128000,
                })
            }
            //console.log("mime type,",mediaRef.current.mimeType)

        } catch(error) {

            console.log(error)

            mediaRef.current = new MediaRecorder(stream, {
                audioBitsPerSecond: 128000,
            })

        }
    mediaRef.current.start()
    mediaRef.current.addEventListener('dataavailable', handleData)
    mediaRef.current.addEventListener("stop", handleStop)
    
      //setRecording(true)
      
    }

    const sendData = async (name:string, datetime:string, file:File) => {
        const extension = name.split('.').pop();
        let options = {
            endpoint: 'transcriptions',
            temperature: 0,
            language:getReadLang(), 
            type:extension,
            format:'text'
        }
        
        let formData = new FormData()
        formData.append('file', file, `${name}`)
        formData.append('name', name)
        formData.append('datetime', datetime)
        formData.append('options', JSON.stringify(options))

        //console.log("[send data]", file,`${name}`)

        try {

            const url = 'https://voice.bus-ai.com'//'https://openai-whisper-api-omega.vercel.app/api/'
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
                signal: abortControllerRef.current?.signal,
            })

            //console.log(response)
            if(!response.ok) {
                const result = await response.json()
                
                /**
                 * I am assuming that all 500 errors will be caused by
                 * problem in accessing the remote API endpoint for simplicity.
                 */
                if(response.status === 500) {
                 //   setOpenSnack(true)
                }

            }

            const result = await response.json()

           // setSendCount((prev) => prev - 1)

            console.log("[received data]", (new Date()).toLocaleTimeString())
            console.log("[received data]", result.data)
            /**
             * verify if result does not contain any useful data, disregard
             */
            const data = result.data
            
            if(data) {

                /**
                 * we will check if there is timestamp
                 * we are using vtt format so we should always have it
                 */
                handleUserinput(data)

            }
            

        } catch(err) {
            console.log(err)
        }

    }


    const handleStart = () => {
        if(startRef.current === startStates.default) {

            startRef.current = startStates.active

            state = startStates.active
            setRecording(true)
            navigator.mediaDevices.getUserMedia({ audio: true }).then(handleStream).catch(handleError)

        } else {

            //console.log("mediaRef.current?.state2 ",mediaRef.current?.state )
            if(mediaRef.current?.state !== 'inactive') {
                mediaRef.current?.stop()
            }

            setRecording(false)
            recordRef.current = false
            
            startRef.current = startStates.default
            state = startStates.default

        }

    }

    const handleData = (e:BlobEvent) => {
      chunksRef.current.push(e.data)
  
    }
  
    const handleStop = async () => {
        //handleData(e)

      //console.log('chunks',chunksRef.current)
      if (MediaRecorder.isTypeSupported('audio/webm')) {
          
        const blob = new Blob(chunksRef.current, {type: 'audio/webm;codecs=opus'})
        const datetime = (new Date()).toISOString()
        const name = `file${Date.now()}` + Math.round(Math.random() * 100000)+'.webm'
        const file = new File([blob], `${name}`)
        chunksRef.current = []
        sendData(name, datetime, file)
    }
    else{
        const blob = new Blob(chunksRef.current, {type: 'audio/mp4'})
        const datetime = (new Date()).toISOString()
        const name = `file${Date.now()}` + Math.round(Math.random() * 100000)+'.mp4'
        const file = new File([blob], `${name}`)

        chunksRef.current = []
        //console.log(file.size)
        sendData(name, datetime, file)

    }
  
    }
  
    const handleError = (error:Error) => {
      console.log(error)
      //setErrorMessage('Error calling getUserMedia')
  }
    const requestMicrophonePermission = async () => {
      try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermission('granted');
      } catch (err) {
      setPermission('denied');
      }
    };


    useEffect(() => {
       requestMicrophonePermission();
    }, []);


    let classIcon = state === startStates.default ? classes.defaultColor : classes.activateColor
    
    return (
          <div  onClick={permission === 'denied' ? requestMicrophonePermission : (handleStart)}> 
{/* /*        <div  onClick={disabled?requestMicrophonePermission : handleStart}> */}
            <div>
                <div >
                    {
                        !isRecording ? <MicIcon className={classes.disabledColor} /> : <MicOnIcon className={classIcon} />
                    }
                </div>
{/*                 {
                    (!disabled && startRef.current === startStates.active ) &&
                    <div className={classes.bars}>
                        <AnimatedBars start={isRecording} />
                    </div>
                } */}
            </div>
        </div>
    )
}

export default StartButton
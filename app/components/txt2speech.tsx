import {SpeechConfig,ResultReason,SpeechSynthesizer} from 'microsoft-cognitiveservices-speech-sdk'
import { ReadLang,getReadLang } from '../locales';

const voiceNames: { [key in ReadLang]: string } = {
  en: 'en-US-JennyMultilingualNeural',
  cn: 'zh-CN-YunxiNeural',
  de: 'de-DE-KasperNeural',
  es: 'es-ES-AlvaroNeural',
  jp: 'ja-JP-NanamiNeural',
  // Add other language options and their corresponding voice names here
};


export default function txt2speech(text:string,played:false){
  const subscriptionKey = process.env.NEXT_PUBLIC_TTS_ACCESS_KEY_ID?process.env.NEXT_PUBLIC_TTS_ACCESS_KEY_ID:"";
  const serviceRegion = process.env.NEXT_PUBLIC_TTS_REGION?process.env.NEXT_PUBLIC_TTS_REGION:""; // e.g., "westus"
  const speechConfig = SpeechConfig.fromSubscription(subscriptionKey,serviceRegion);
        speechConfig.speechSynthesisLanguage = "zh-CN"; 
    // speechConfig.speechSynthesisVoiceName = "zh-CN-henan-YundengNeural";
      
  //const played = React.useRef(false)
  let synthesizer = new SpeechSynthesizer(speechConfig);
 // console.log("played",played)
      const timeTagRegex = /\d{2}:\d{2}:\d{2}\.\d{3}\s-->\s\d{2}:\d{2}:\d{2}\.\d{3}/g;

      //const results = text.data.replace(timeTagRegex, '').replace(/^WEBVTT\s*/i, '');
      const speechSynthesisVoiceName = process.env.NEXT_PUBLIC_SPEECHNAME;
     // const results="Uitstel aanvragen voor de belastingaangifte 2022 - hoe doe ik dat? Of u uitstel kunt krijgen, hangt af van wanneer uw aangifte bij ons binnen moet zijn. Dit staat in uw aangiftebrief. Uw aangifte moest vóór 1 mei 2023 bij ons binnen zijn.U kunt hiervoor géén uitstel meer aanvragen. Doe daarom zo snel mogelijk aangifte.Uw aangifte moet op een andere datum bij ons binnen zijn .Dan kunt u uitstel aanvragen tot de datum dat de aangifte bij ons binnen moet zijn."
      const ssmlText = `
      <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='zh-CN'>
        <voice name="${voiceNames[getReadLang()]}">
            <mstts:express-as style='${process.env.NEXT_PUBLIC_SPEECHSTYLE}' styledegree='1'>
                ${text}
            </mstts:express-as>
        </voice>
      </speak>`;
      try{
        synthesizer.speakSsmlAsync(
          ssmlText,
          (result) => {
            if (result.reason === ResultReason.SynthesizingAudioCompleted) {
              console.log("Synthesis finished.");
            } else {
              console.error(
                `Speech synthesis canceled, ${result.errorDetails}\nDid you update the subscription info?`
              );
            }
            synthesizer?.close();
          },
          (err) => {
            console.trace(`Error - ${err}`);
            synthesizer?.close();
          }
        );
      }
      catch(error){
          console.log(error)

      }
  
      const stopSpeechSynthesis = () => {
        if (synthesizer) {
          synthesizer.close();
        }
      };
      
}
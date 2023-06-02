import { Marker } from '@react-google-maps/api'
import React, { FC, useEffect, useRef, useState } from 'react'
import 'jquery'

interface MakerProps {
    position: any
}



const CustomMarker: FC<MakerProps> = ({
    position
}) => {

    function animateMarkerTo(marker: any, newPosition: any) {

        
        var options = {
          duration: 500,
          easing: function (x: any, t: any, b: any, c: any, d: any) {
            // jquery animation: swing (easeOutQuad)
            return -c * (t /= d) * (t - 2) + b;
          }
        };
      
        window.requestAnimationFrame =
          window.requestAnimationFrame
           ||
        //   @ts-ignore
          window.mozRequestAnimationFrame ||
        //   @ts-ignore
          window.webkitRequestAnimationFrame ||
        //   @ts-ignore
          window.msRequestAnimationFrame;
        window.cancelAnimationFrame =
        // @ts-ignore
          window.cancelAnimationFrame || window.mozCancelAnimationFrame;
      
        // save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
        marker.AT_startPosition_lat = marker.getPosition().lat();
        marker.AT_startPosition_lng = marker.getPosition().lng();

        var newPosition_lat = newPosition.latitude;
        var newPosition_lng = newPosition.longitude;
      
        // crossing the 180° meridian and going the long way around the earth?
        if (Math.abs(newPosition_lng - marker.AT_startPosition_lng) > 180) {
          if (newPosition_lng > marker.AT_startPosition_lng) {
            newPosition_lng -= 360;
          } else {
            newPosition_lng += 360;
          }
        }
      
        var animateStep = function (marker: any, startTime: any) {
          var ellapsedTime = new Date().getTime() - startTime;
          var durationRatio = ellapsedTime / options.duration; // 0 - 1
          var easingDurationRatio = options.easing(
            durationRatio,
            ellapsedTime,
            0,
            1,
            options.duration
          );
      
          if (durationRatio < 1) {
            marker.setPosition({
              lat:
                marker.AT_startPosition_lat +
                (newPosition_lat - marker.AT_startPosition_lat) * easingDurationRatio,
              lng:
                marker.AT_startPosition_lng +
                (newPosition_lng - marker.AT_startPosition_lng) * easingDurationRatio
            });
      
            // use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~60 fps
            if (window.requestAnimationFrame) {
              marker.AT_animationHandler = window.requestAnimationFrame(function () {
                animateStep(marker, startTime);
              });
            } else {
              marker.AT_animationHandler = setTimeout(function () {
                animateStep(marker, startTime);
              }, 17);
            }
          } else {
            marker.setPosition(newPosition);
          }
        };
      
        // stop possibly running animation
        if (window.cancelAnimationFrame) {
          window.cancelAnimationFrame(marker.AT_animationHandler);
        } else {
          clearTimeout(marker.AT_animationHandler);
        }
      
        animateStep(marker, new Date().getTime());
        return
      }

    const markerRef = useRef<any>(null)
    const [testing, setTesting] = useState(position)

    useEffect(() => {
        // console.log(testing, 'old data')
        // console.log(position, 'custom-marker');
        animateMarkerTo(markerRef.current.marker, position)
        // setTesting(prev => prev +=1)
        // console.log(testing, 'new data');
    })

  return (
    <Marker
    ref={markerRef}
    // draggable
    position={testing}
    />
  )
}

export default React.memo(CustomMarker)
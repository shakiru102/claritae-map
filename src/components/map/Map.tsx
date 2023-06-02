import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import React, { createRef, FC, useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"
import { useSelector } from "react-redux"
import { RootState } from "../../store"
import { useDispatch } from "react-redux"
import { setPositions } from "../../store/reducers/positions"
import useWebSocket from 'react-use-websocket';
import { updateDevice } from "../../store/reducers/devices"
import useDynamicRefs from 'use-dynamic-refs'
// https://stackoverflow.com/a/55043218/9058905
// @ts-ignore
function animateMarkerTo(marker, newPosition) {
  console.log(marker, 'marker');
  
    var options = {
      duration: 1000,
      // @ts-ignore
      easing: function (x, t, b, c, d) {
        // jquery animation: swing (easeOutQuad)
        return -c * (t /= d) * (t - 2) + b;
      }
    };
  
    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      // @ts-ignore
      window.mozRequestAnimationFrame ||
      // @ts-ignore
      window.webkitRequestAnimationFrame ||
      // @ts-ignore
      window.msRequestAnimationFrame;
    window.cancelAnimationFrame =
    // @ts-ignore
      window.cancelAnimationFrame || window.mozCancelAnimationFrame;
  
    // save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
    marker.AT_startPosition_lat = marker.getPosition().lat();
    marker.AT_startPosition_lng = marker.getPosition().lng();
    // console.log(newPosition.lat(), newPosition.lng());
    
    var newPosition_lat = newPosition.lat;
    var newPosition_lng = newPosition.lng;
  
    // crossing the 180° meridian and going the long way around the earth?
    if (Math.abs(newPosition_lng - marker.AT_startPosition_lng) > 180) {
      if (newPosition_lng > marker.AT_startPosition_lng) {
        newPosition_lng -= 360;
      } else {
        newPosition_lng += 360;
      }
    }
  
    // @ts-ignore
    var animateStep = function (marker, startTime) {
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
        // setPosition({ lat: newPosition.lat, lng: newPosition.lng })
      } else {
        marker.setPosition(newPosition);
        // setPosition({ lat: newPosition.lat, lng: newPosition.lng })
      }
    };
  
    // stop possibly running animation
    if (window.cancelAnimationFrame) {
      window.cancelAnimationFrame(marker.AT_animationHandler);
    } else {
      clearTimeout(marker.AT_animationHandler);
    }
  
    animateStep(marker, new Date().getTime());
  }

function MyComponent() {

  const [position, setPosition] = useState([])
  const [center] = useState({ lat: 6.6018, lng: 3.3515 })
  // const markersRef = useRef(position.map(() => createRef()))
  const [markersRef, setMarkersRef] =  useDynamicRefs()


  const dispatch = useDispatch()
  const mapRef = React.useRef(null);

  useWebSocket('ws://localhost:8082/api/socket', {
  onOpen: (e) => console.log(e),
  onMessage: (event) =>{
     const dataType: any = Object.keys(JSON.parse(event.data))
     console.log(Object.entries(JSON.parse(event.data)));
     if(dataType[0] === 'positions') {
      // {lat: 6.6017881, lng: 3.3515526}
      const data = JSON.parse(event.data)
      // console.log(data.positions[0].latitude);
   
   if(data.positions.length > 1) {
    setPosition(data.positions);
    console.log(markersRef(data.positions[0].deviceId), 'testing');
   }else {
    console.log(markersRef(data.positions[0].deviceId), 'testing');
    // @ts-ignore
      animateMarkerTo(markersRef(data.positions[0].deviceId).current.marker, {lat: data.positions[0].latitude, lng: data.positions[0].longitude});
      setTimeout(() => {
         setPosition((prev: any) => {
          return prev.map((item: any ) => {
            return item.deviceId === data.positions[0].deviceId ? { ...item, latitude: data.positions[0].latitude, longitude: data.positions[0].longitude } : {...item}
          })
         })
      }, 1000)
   }
       
      // @ts-ignore 
      // dispatch(setPositions(JSON.parse(event.data)))
    }
     else dispatch(updateDevice(JSON.parse(event.data)))
  }
  // onMessage: (event: any) => console.log(event)
});


  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: `AIzaSyAyrUcSNFScyiXxZJIZOlkYWdbBRQikFTY`,
  });


 
// @ts-ignore
  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds({ lat: 6.6018, lng: 3.3515 });
    map.fitBounds(bounds);
    mapRef.current = map;
  }, []);

  // @ts-ignore
  const onClick = React.useCallback((event) => {
    // @ts-ignore
    animateMarkerTo(markerRef.current.marker, {lat: 6.6017881, lng: 3.3515526});
  }, []);

  // @ts-ignore
  const onUnmount = React.useCallback(function callback(map) {
    mapRef.current = null;
  }, []);

  // useEffect(() => {
    
    
  // })

  return isLoaded ? (
    <div className="map-container">
    <GoogleMap
      mapContainerStyle={{
        height: '100vh',
        width: '100vw'
      }}
      center={center}
      zoom={10}
      // onLoad={onLoad}
      onUnmount={onUnmount}
    >
     { position.map((item: any, index: number) => (
      // @ts-ignore
       <Marker key={index} ref={setMarkersRef(item.deviceId)} position={{ lat: item.latitude, lng: item.longitude }} /> 
     )) }
      {/* <Marker  position={position} /> */}
    </GoogleMap>
    </div>
  ) : (
    <></>
  );
}

export default React.memo(MyComponent);

// import { DirectionsRenderer, GoogleMap, InfoWindow, Marker, useJsApiLoader, Polyline } from "@react-google-maps/api"
// import './map.css'
// import TruckFill from '../../assets/truckfill.svg'
// import Truck from '../../assets/truck.svg'
// import React, { FC, useEffect, useState } from "react"
// import axios from "axios"
// import { useSelector } from "react-redux"
// import { RootState } from "../../store"
// import { useDispatch } from "react-redux"
// import { setPositions } from "../../store/reducers/positions"
// import useWebSocket from 'react-use-websocket';
// import { updateDevice } from "../../store/reducers/devices"
// import CustomMarker from "./CustomMarker"

// interface MarkersProps {
//     position: { lat: number, lng: number },
//     destination: { lat: number, lng: number },
//     coupled: boolean;
//     id: number;
//     text: string;
// }

 


// const Map = () => {
//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: `AIzaSyAyrUcSNFScyiXxZJIZOlkYWdbBRQikFTY`,
// })

// const [center] = useState({ lat: 6.6018, lng: 3.3515 })
//    const { positions } = useSelector((state: RootState) => state.positions)
//    const { devices } = useSelector((state: RootState) => state.devices)
   
//    const dispatch = useDispatch()

// useWebSocket('ws://localhost:8082/api/socket', {
//   onOpen: (e) => console.log(e),
//   onMessage: (event) =>{
//      const dataType: any = Object.keys(JSON.parse(event.data))
//      console.log(Object.entries(JSON.parse(event.data)));
//      if(dataType[0] === 'positions') dispatch(setPositions(JSON.parse(event.data)))
//      else dispatch(updateDevice(JSON.parse(event.data)))
//   }
//   // onMessage: (event: any) => console.log(event)
// });
   
//    const markers: MarkersProps[] = [
//      { 
//         position: { lat: 6.6018, lng: 3.3315 },
//         destination: { lat: 6.6018, lng: 3.3515 },
//         coupled: false,
//         id: 1,
//         text: 'This truck is not coupled'

//      },
//      { 
//         position: { lat: 6.6018, lng: 3.3515 },
//         destination: { lat: 6.6018, lng: 3.3315 },
//         coupled: true,
//         id: 2,
//         text: 'This truck is coupled'

//      }
//    ]
  
   
   
//    const [activemarker, setactivermarker] = useState<MarkersProps | null >(null)
//    const [directionsResponse, setDirectionResponse] = useState<any>(null)

  
//     if(!isLoaded) return <div>Loading....</div>
    
//     const directions = new google.maps.DirectionsService()

//     const deviceIndex = (id: any) => devices.findIndex((item: any) => item.id === id)


//   return (
//     <div className="map-container">
//         <GoogleMap 
//         zoom={5}
//         center={center}
//         mapContainerStyle={{
//             height: '100%',
//             width: '100%'
//         }}>
//          { positions !== null && <CustomMarker position={{ lat: positions.positions[4].latitude, lng: positions.positions[4].longitude  }} /> }
//          { positions !== null && <CustomMarker position={{ lat: positions.positions[7].latitude, lng: positions.positions[7].longitude  }} /> }
//           {
//             positions !== null &&
//             positions.positions.map((item: any ) => {
//              return (
//               <Marker 
//               key={item.id}
//               position={{ lat: item.latitude, lng: item.longitude }}
//               clickable
//               label={ devices[deviceIndex(item.deviceId)].name}
//               icon={{
//                   url:  TruckFill,
//                   scaledSize: new google.maps.Size( activemarker?.id === item.id ? 37 : 30, activemarker?.id === item.id ? 37 : 30),
//               }}
//               // animation={google.maps.Animation.DROP}
//               onClick={async () => {
//                 setactivermarker(item)
//                 if(activemarker){
//                   console.log(activemarker);
                  
//                   try {
//                     const results = await directions.route({
//                       origin: new google.maps.LatLng(item.latitude, item.longitude),
//                       destination: 'Gasco Marine Ltd., 1 Cable St, Lagos Island 102273, Lagos',
//                       travelMode: google.maps.TravelMode.DRIVING
//                     })
//                     console.log(results.routes[0].legs[0].start_address)
//                     setDirectionResponse(results)
//                   } catch (error: any) {
//                     console.log(error) 
//                   }
//                 }
//               }}

//               >
//               {
//                   activemarker?.id === item.id && directionsResponse !== null ?
//                   (
//                    <InfoWindow  onCloseClick={() => {
//                     setactivermarker(null)
//                     setDirectionResponse(null)
//                    }}>
//                       <>
//                       <div>{item.text}</div>
//                       <div>start address: { directionsResponse.routes[0].legs[0].start_address }</div>
//                       <div>end address: { directionsResponse.routes[0].legs[0].end_address }</div>
//                       <div>distance: { directionsResponse.routes[0].legs[0].distance.text }</div>
//                       <div>duration: { directionsResponse.routes[0].legs[0].duration.text }</div>
//                       </>
//                    </InfoWindow>    
//                   ) : null
//                  }
//               </Marker> 
//           )

//             })
//           }  
//          { directionsResponse !== null &&
//           <DirectionsRenderer 
//             directions={directionsResponse}
//             />
//           }
//     </GoogleMap>
//     </div>
//   )
// }

// export default React.memo(Map)
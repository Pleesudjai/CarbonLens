/**
 * existingTransit.js
 * Official Valley Metro baseline lines for the Phoenix MVP, simplified from
 * the public GTFS feed active 2026-01-26 through 2026-04-26.
 */

const PHOENIX_EXISTING_TRANSIT = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'A',
        shortName: 'A',
        longName: 'Valley Metro Rail A Line',
        color: '#1E8ECD',
      },
      geometry: {
        type: 'LineString',
        coordinates: [[-112.074423, 33.447058], [-112.070092, 33.446303], [-112.066892, 33.446656], [-112.060646, 33.447191], [-112.047944, 33.44725], [-112.029263, 33.447183], [-112.025787, 33.448112], [-112.010403, 33.448157], [-111.993035, 33.448104], [-111.983794, 33.447992], [-111.971112, 33.446461], [-111.965416, 33.445824], [-111.95771, 33.443939], [-111.954819, 33.440799], [-111.948803, 33.439318], [-111.944981, 33.436954], [-111.943488, 33.431945], [-111.943195, 33.428186], [-111.940697, 33.427498], [-111.937454, 33.42663], [-111.934953, 33.425686], [-111.931485, 33.423578], [-111.929416, 33.422926], [-111.920944, 33.415421], [-111.916899, 33.414757], [-111.908877, 33.41472], [-111.900799, 33.414782], [-111.889935, 33.41478], [-111.880472, 33.414809], [-111.870907, 33.414849], [-111.859798, 33.414888], [-111.849789, 33.414999], [-111.838078, 33.415106], [-111.822135, 33.415057], [-111.804381, 33.415176], [-111.797903, 33.415251], [-111.790741, 33.415318]],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'B',
        shortName: 'B',
        longName: 'Valley Metro Rail B Line',
        color: '#B76912',
      },
      geometry: {
        type: 'LineString',
        coordinates: [[-112.118471, 33.575095], [-112.113652, 33.574952], [-112.112666, 33.574759], [-112.112181, 33.574129], [-112.112171, 33.570782], [-112.112452, 33.568048], [-112.111941, 33.567582], [-112.106359, 33.56755], [-112.102087, 33.56742], [-112.09997, 33.567367], [-112.09964, 33.558358], [-112.099596, 33.551583], [-112.099586, 33.544079], [-112.099663, 33.537448], [-112.099711, 33.529908], [-112.099717, 33.522981], [-112.099755, 33.518042], [-112.099843, 33.511961], [-112.098823, 33.50954], [-112.086417, 33.509426], [-112.07695, 33.509265], [-112.073815, 33.507964], [-112.073768, 33.501398], [-112.073813, 33.493823], [-112.073805, 33.484274], [-112.073813, 33.476142], [-112.073811, 33.464703], [-112.073863, 33.461066], [-112.074365, 33.458791], [-112.075076, 33.45634], [-112.075121, 33.450172], [-112.075166, 33.446725], [-112.074897, 33.443348], [-112.074947, 33.440941], [-112.073785, 33.438361], [-112.073734, 33.429182], [-112.073325, 33.420162], [-112.073412, 33.414132], [-112.073331, 33.40461], [-112.073313, 33.394179], [-112.073308, 33.38482], [-112.073266, 33.378556]],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'S',
        shortName: 'S',
        longName: 'Valley Metro Streetcar',
        color: '#6D8932',
      },
      geometry: {
        type: 'LineString',
        coordinates: [[-111.932684, 33.42935], [-111.933835, 33.429458], [-111.935546, 33.43049], [-111.937064, 33.430589], [-111.938171, 33.430136], [-111.93891, 33.429755], [-111.940528, 33.429611], [-111.942106, 33.42948], [-111.94269, 33.429305], [-111.942598, 33.428818], [-111.94255, 33.428024], [-111.942984, 33.427381], [-111.943334, 33.426824], [-111.943409, 33.425103], [-111.943126, 33.423937], [-111.942517, 33.422968], [-111.942452, 33.422104], [-111.942178, 33.421891], [-111.940194, 33.421919], [-111.94003, 33.421666], [-111.940025, 33.420559], [-111.939987, 33.417624], [-111.93934, 33.415638], [-111.938054, 33.414821], [-111.93527, 33.414621], [-111.930283, 33.414662], [-111.925801, 33.414695], [-111.921314, 33.414742], [-111.920079, 33.414707], [-111.916981, 33.414696]],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'SKYT',
        shortName: 'SKYT',
        longName: 'PHX Sky Train',
        color: '#53565F',
      },
      geometry: {
        type: 'LineString',
        coordinates: [[-112.044493, 33.430794], [-112.042251, 33.43197], [-112.04094, 33.431439], [-112.03685, 33.431429], [-112.036237, 33.431865], [-112.036136, 33.434143], [-112.035618, 33.434887], [-112.034514, 33.435237], [-112.028527, 33.435267], [-112.026314, 33.43575], [-112.014359, 33.435657], [-112.009982, 33.434733], [-111.999922, 33.434795], [-111.998837, 33.434728], [-111.995403, 33.434767], [-111.990745, 33.434782], [-111.988548, 33.434106], [-111.987508, 33.433894], [-111.98429, 33.434827], [-111.983148, 33.435206], [-111.983139, 33.436094], [-111.98589, 33.437945], [-111.987452, 33.440391], [-111.987871, 33.442988], [-111.987744, 33.445459], [-111.98866, 33.446696], [-111.989188, 33.446947], [-111.990022, 33.446946]],
      },
    },
  ],
}

const PHOENIX_EXISTING_STATIONS = {
  type: 'FeatureCollection',
  features: [
    // A
    { type: 'Feature', properties: { id: '9794', route: 'A', name: 'Downtown Phx Hub/Jefferson St' }, geometry: { type: 'Point', coordinates: [-112.074424, 33.447106] } },
    { type: 'Feature', properties: { id: '9004', route: 'A', name: '3rd St/Jefferson' }, geometry: { type: 'Point', coordinates: [-112.069297, 33.446274] } },
    { type: 'Feature', properties: { id: '9000', route: 'A', name: '12th St/Jefferson' }, geometry: { type: 'Point', coordinates: [-112.055664, 33.447199] } },
    { type: 'Feature', properties: { id: '9002', route: 'A', name: '24th St/Jefferson' }, geometry: { type: 'Point', coordinates: [-112.029262, 33.447229] } },
    { type: 'Feature', properties: { id: '9003', route: 'A', name: '38th St/Washington' }, geometry: { type: 'Point', coordinates: [-111.999879, 33.448102] } },
    { type: 'Feature', properties: { id: '9005', route: 'A', name: '44th St/Washington' }, geometry: { type: 'Point', coordinates: [-111.98798, 33.448168] } },
    { type: 'Feature', properties: { id: '9765', route: 'A', name: '50th St/Washington St' }, geometry: { type: 'Point', coordinates: [-111.975231, 33.446946] } },
    { type: 'Feature', properties: { id: '9020', route: 'A', name: 'Priest Dr/Washington St' }, geometry: { type: 'Point', coordinates: [-111.956107, 33.442008] } },
    { type: 'Feature', properties: { id: '9008', route: 'A', name: 'Center Pkwy/Washington' }, geometry: { type: 'Point', coordinates: [-111.946605, 33.438047] } },
    { type: 'Feature', properties: { id: '9016', route: 'A', name: 'Mill Ave/3rd St' }, geometry: { type: 'Point', coordinates: [-111.940697, 33.427452] } },
    { type: 'Feature', properties: { id: '9027', route: 'A', name: 'Veterans Way/College Ave' }, geometry: { type: 'Point', coordinates: [-111.935961, 33.426069] } },
    { type: 'Feature', properties: { id: '9025', route: 'A', name: 'University Dr/Rural Rd' }, geometry: { type: 'Point', coordinates: [-111.92697, 33.420732] } },
    { type: 'Feature', properties: { id: '9010', route: 'A', name: 'Dorsey Ln/Apache Blvd' }, geometry: { type: 'Point', coordinates: [-111.916899, 33.414759] } },
    { type: 'Feature', properties: { id: '9014', route: 'A', name: 'McClintock Dr/Apache Blvd' }, geometry: { type: 'Point', coordinates: [-111.908268, 33.414727] } },
    { type: 'Feature', properties: { id: '9022', route: 'A', name: 'Smith-Martin/Apache Blvd' }, geometry: { type: 'Point', coordinates: [-111.900799, 33.414783] } },
    { type: 'Feature', properties: { id: '9019', route: 'A', name: 'Price-101/Apache Blvd' }, geometry: { type: 'Point', coordinates: [-111.888114, 33.414821] } },
    { type: 'Feature', properties: { id: '9023', route: 'A', name: 'Sycamore/Main St' }, geometry: { type: 'Point', coordinates: [-111.870907, 33.414855] } },
    { type: 'Feature', properties: { id: '9126', route: 'A', name: 'Alma School/Main St' }, geometry: { type: 'Point', coordinates: [-111.855564, 33.41494] } },
    { type: 'Feature', properties: { id: '9353', route: 'A', name: 'Country Club/Main St' }, geometry: { type: 'Point', coordinates: [-111.839073, 33.415103] } },
    { type: 'Feature', properties: { id: '9499', route: 'A', name: 'Center/Main St' }, geometry: { type: 'Point', coordinates: [-111.830654, 33.415096] } },
    { type: 'Feature', properties: { id: '9508', route: 'A', name: 'Mesa Dr/Main St' }, geometry: { type: 'Point', coordinates: [-111.822135, 33.415066] } },
    { type: 'Feature', properties: { id: '8328', route: 'A', name: 'Stapley Dr/Main St' }, geometry: { type: 'Point', coordinates: [-111.803099, 33.415225] } },
    { type: 'Feature', properties: { id: '9763', route: 'A', name: 'Gilbert Rd/Main St' }, geometry: { type: 'Point', coordinates: [-111.790741, 33.415331] } },

    // B
    { type: 'Feature', properties: { id: '9773', route: 'B', name: 'Metro Pkwy' }, geometry: { type: 'Point', coordinates: [-112.118471, 33.575092] } },
    { type: 'Feature', properties: { id: '9775', route: 'B', name: 'Mountain View/25th Ave' }, geometry: { type: 'Point', coordinates: [-112.112144, 33.573217] } },
    { type: 'Feature', properties: { id: '9778', route: 'B', name: '25th Ave/Dunlap' }, geometry: { type: 'Point', coordinates: [-112.111436, 33.567576] } },
    { type: 'Feature', properties: { id: '6660', route: 'B', name: '19th Ave/Dunlap' }, geometry: { type: 'Point', coordinates: [-112.100848, 33.567384] } },
    { type: 'Feature', properties: { id: '6658', route: 'B', name: 'Northern/19th Ave' }, geometry: { type: 'Point', coordinates: [-112.099612, 33.55227] } },
    { type: 'Feature', properties: { id: '6656', route: 'B', name: 'Glendale/19th Ave' }, geometry: { type: 'Point', coordinates: [-112.099663, 33.537448] } },
    { type: 'Feature', properties: { id: '9017', route: 'B', name: 'Montebello/19th Ave' }, geometry: { type: 'Point', coordinates: [-112.099722, 33.520585] } },
    { type: 'Feature', properties: { id: '9001', route: 'B', name: '19th Ave/Camelback' }, geometry: { type: 'Point', coordinates: [-112.098823, 33.509537] } },
    { type: 'Feature', properties: { id: '9006', route: 'B', name: '7th Ave/Camelback' }, geometry: { type: 'Point', coordinates: [-112.083335, 33.509288] } },
    { type: 'Feature', properties: { id: '9009', route: 'B', name: 'Central Ave/Camelback' }, geometry: { type: 'Point', coordinates: [-112.075192, 33.50855] } },
    { type: 'Feature', properties: { id: '9007', route: 'B', name: 'Campbell/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073768, 33.501398] } },
    { type: 'Feature', properties: { id: '9012', route: 'B', name: 'Indian School/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073773, 33.495749] } },
    { type: 'Feature', properties: { id: '9018', route: 'B', name: 'Osborn/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073794, 33.48686] } },
    { type: 'Feature', properties: { id: '9024', route: 'B', name: 'Thomas/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073761, 33.481233] } },
    { type: 'Feature', properties: { id: '9011', route: 'B', name: 'Encanto/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073799, 33.473655] } },
    { type: 'Feature', properties: { id: '9015', route: 'B', name: 'McDowell/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073811, 33.464703] } },
    { type: 'Feature', properties: { id: '9021', route: 'B', name: 'Roosevelt/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.074011, 33.459391] } },
    { type: 'Feature', properties: { id: '9026', route: 'B', name: 'Van Buren/1st Ave' }, geometry: { type: 'Point', coordinates: [-112.075038, 33.451861] } },
    { type: 'Feature', properties: { id: '9792', route: 'B', name: 'Downtown Phx Hub/1st Ave' }, geometry: { type: 'Point', coordinates: [-112.075234, 33.447823] } },
    { type: 'Feature', properties: { id: '9790', route: 'B', name: 'Lincoln/1st Ave' }, geometry: { type: 'Point', coordinates: [-112.074963, 33.441681] } },
    { type: 'Feature', properties: { id: '9788', route: 'B', name: 'Buckeye/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073738, 33.435951] } },
    { type: 'Feature', properties: { id: '9786', route: 'B', name: 'Pioneer/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073508, 33.41844] } },
    { type: 'Feature', properties: { id: '9799', route: 'B', name: 'Broadway/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073291, 33.405948] } },
    { type: 'Feature', properties: { id: '9784', route: 'B', name: 'Roeser/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.07335, 33.398836] } },
    { type: 'Feature', properties: { id: '9782', route: 'B', name: 'Southern/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073317, 33.391492] } },
    { type: 'Feature', properties: { id: '9781', route: 'B', name: 'Baseline/Central Ave' }, geometry: { type: 'Point', coordinates: [-112.073268, 33.378556] } },

    // Streetcar
    { type: 'Feature', properties: { id: '9766', route: 'S', name: 'Marina Heights/Rio Salado' }, geometry: { type: 'Point', coordinates: [-111.932684, 33.429352] } },
    { type: 'Feature', properties: { id: '9419', route: 'S', name: 'Hayden Ferry/Rio Salado' }, geometry: { type: 'Point', coordinates: [-111.938171, 33.430136] } },
    { type: 'Feature', properties: { id: '9767', route: 'S', name: 'Tempe Beach Park/Rio Salado' }, geometry: { type: 'Point', coordinates: [-111.941997, 33.429452] } },
    { type: 'Feature', properties: { id: '9525', route: 'S', name: 'Third St/Ash' }, geometry: { type: 'Point', coordinates: [-111.943019, 33.427402] } },
    { type: 'Feature', properties: { id: '9545', route: 'S', name: 'Fifth St/Ash' }, geometry: { type: 'Point', coordinates: [-111.943457, 33.425103] } },
    { type: 'Feature', properties: { id: '9768', route: 'S', name: 'University Dr/Ash' }, geometry: { type: 'Point', coordinates: [-111.942501, 33.422355] } },
    { type: 'Feature', properties: { id: '9551', route: 'S', name: 'Ninth St/Mill' }, geometry: { type: 'Point', coordinates: [-111.939933, 33.420922] } },
    { type: 'Feature', properties: { id: '9546', route: 'S', name: 'Eleventh St/Mill' }, geometry: { type: 'Point', coordinates: [-111.939923, 33.418088] } },
    { type: 'Feature', properties: { id: '9769', route: 'S', name: 'College Ave/Apache' }, geometry: { type: 'Point', coordinates: [-111.935271, 33.414678] } },
    { type: 'Feature', properties: { id: '9666', route: 'S', name: 'Paseo Del Saber/Apache' }, geometry: { type: 'Point', coordinates: [-111.929371, 33.414734] } },
    { type: 'Feature', properties: { id: '9099', route: 'S', name: 'Rural/Apache' }, geometry: { type: 'Point', coordinates: [-111.92525, 33.41476] } },
    { type: 'Feature', properties: { id: '9694', route: 'S', name: 'Dorsey Ln/Apache' }, geometry: { type: 'Point', coordinates: [-111.916981, 33.414653] } },

    // Sky Train
    { type: 'Feature', properties: { id: 'SKTR6', route: 'SKYT', name: 'Rental Car Center Station' }, geometry: { type: 'Point', coordinates: [-112.044493, 33.430794] } },
    { type: 'Feature', properties: { id: 'SKTR5', route: 'SKYT', name: '24th St Station' }, geometry: { type: 'Point', coordinates: [-112.032613, 33.435246] } },
    { type: 'Feature', properties: { id: 'SKTR3', route: 'SKYT', name: 'Terminal 3 Station' }, geometry: { type: 'Point', coordinates: [-112.009982, 33.434733] } },
    { type: 'Feature', properties: { id: 'SKTR4', route: 'SKYT', name: 'Terminal 4 Station' }, geometry: { type: 'Point', coordinates: [-111.998028, 33.43473] } },
    { type: 'Feature', properties: { id: 'SKTR2', route: 'SKYT', name: 'East Economy Station' }, geometry: { type: 'Point', coordinates: [-111.984922, 33.434637] } },
    { type: 'Feature', properties: { id: 'SKTR1', route: 'SKYT', name: '44th St Station' }, geometry: { type: 'Point', coordinates: [-111.990022, 33.446946] } },
  ],
}

const STATION_PHOTO_OVERRIDES = {
  '19th Ave/Camelback': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/METRO_Light_Rail_19th_Avenue_Station.jpg',
    photoCaption: '19th Ave/Camelback station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/19th%20Avenue/Camelback%20station',
  },
  '19th Ave/Dunlap': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/19th_Avenue_station.JPG',
    photoCaption: '19th Ave/Dunlap station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/19th%20Avenue/Dunlap%20station',
  },
  '38th St/Washington': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/METRO_Light_Rail_Gateway_Community_College_Station.jpg',
    photoCaption: '38th St/Washington station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/38th%20Street/Washington%20station',
  },
  '44th St/Washington': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/METRO_Light_Rail_Sky_Harbor_Airport_Station.jpg',
    photoCaption: '44th St/Washington station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/44th%20Street/Washington%20station',
  },
  '7th Ave/Camelback': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/METRO_Light_Rail_Melrose_District_Station.jpg',
    photoCaption: '7th Ave/Camelback station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/7th%20Avenue/Camelback%20station',
  },
  'Alma School/Main St': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Alma_School_Station_VMR.jpg',
    photoCaption: 'Alma School/Main St station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Alma%20School/Main%20Street%20station',
  },
  'Campbell/Central Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/METRO_Light_Rail_Campbell_Avenue_Station.jpg',
    photoCaption: 'Campbell/Central Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Campbell/Central%20Avenue%20station',
  },
  'Center Pkwy/Washington': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/METRO_Light_Rail_Center_Parkway_Station.jpg',
    photoCaption: 'Center Pkwy/Washington station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Center%20Parkway/Washington%20station',
  },
  'Center/Main St': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Center_St_Station_VMR.jpg',
    photoCaption: 'Center/Main St station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Center/Main%20Street%20station',
  },
  'Central Ave/Camelback': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/METRO_Light_Rail_Uptown_Phoenix_Station.jpg',
    photoCaption: 'Central Ave/Camelback station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Central%20Avenue/Camelback%20station',
  },
  'Country Club/Main St': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Country_Club_Station_VMR.jpg',
    photoCaption: 'Country Club/Main St station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Country%20Club/Main%20Street%20station',
  },
  'Encanto/Central Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/METRO_Light_Rail_Heard_Museum_Station.jpg',
    photoCaption: 'Encanto/Central Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Encanto/Central%20Avenue%20station',
  },
  'Glendale/19th Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Glendale_Avenue_station.JPG',
    photoCaption: 'Glendale/19th Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Glendale/19th%20Avenue%20station',
  },
  'Indian School/Central Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/METRO_Light_Rail_Steele_Indian_School_Park_Station.jpg',
    photoCaption: 'Indian School/Central Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Indian%20School/Central%20Avenue%20station',
  },
  'McDowell/Central Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/32/METRO_Light_Rail_Cultural_District_Station.jpg',
    photoCaption: 'McDowell/Central Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/McDowell/Central%20Avenue%20station',
  },
  'Mesa Dr/Main St': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Mesa_Dr_Station_VMR.jpg',
    photoCaption: 'Mesa Dr/Main St station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Mesa%20Drive/Main%20Street%20station',
  },
  'Mill Ave/3rd St': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Downtown_Tempe_METRO_Station_-_2009-11-13.jpg',
    photoCaption: 'Mill Ave/3rd St station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Mill%20Avenue/3rd%20Street%20station',
  },
  'Montebello/19th Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/77/METRO_Light_Rail_Christown_Station.jpg',
    photoCaption: 'Montebello/19th Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Montebello/19th%20Avenue%20station',
  },
  'Northern/19th Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Northern_Avenue_station.JPG',
    photoCaption: 'Northern/19th Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Northern/19th%20Avenue%20station',
  },
  'Ninth St/Mill': {
    photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/9th%20%26%20Mill%20Station%20-%20Tempe%20Streetcar.jpg',
    photoCaption: '9th/Mill station photo',
    photoCredit: '42-BRT',
    photoSourceUrl: 'https://commons.wikimedia.org/wiki/File:9th_%26_Mill_Station_-_Tempe_Streetcar.jpg',
  },
  'Osborn/Central Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/METRO_Light_Rail_Park_Central_Station.jpg',
    photoCaption: 'Osborn/Central Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Osborn/Central%20Avenue%20station',
  },
  'Priest Dr/Washington St': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/METRO_Light_Rail_Papago_Park_Center_Station.jpg',
    photoCaption: 'Priest Dr/Washington St station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Priest%20Drive/Washington%20station',
  },
  'Roosevelt/Central Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/METRO_Light_Rail_Arts_District_Station.jpg',
    photoCaption: 'Roosevelt/Central Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Roosevelt/Central%20Avenue%20station',
  },
  'Sycamore/Main St': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/METRO_Light_Rail_Tri-City_Station.jpg',
    photoCaption: 'Sycamore/Main St station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Sycamore/Main%20Street%20station',
  },
  'Thomas/Central Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/METRO_Light_Rail_Midtown_Phoenix_Station.jpg',
    photoCaption: 'Thomas/Central Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Thomas/Central%20Avenue%20station',
  },
  'University Dr/Rural Rd': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/METRO_Light_Rail_ASU-Tempe_Campus_Station.jpg',
    photoCaption: 'University Dr/Rural Rd station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/University%20Drive/Rural%20station',
  },
  'Veterans Way/College Ave': {
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/METRO_Light_Rail_Sun_Devil_Station.jpg',
    photoCaption: 'Veterans Way/College Ave station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://en.wikipedia.org/wiki/Veterans%20Way/College%20Avenue%20station',
  },
  '44th St Station': {
    photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Phoenix-Sky%20Train-44%20St.%20Sta.JPG',
    photoCaption: '44th St Station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://commons.wikimedia.org/wiki/Category:44th_Street/Washington_station',
  },
  '24th St Station': {
    photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Phoenix%20Sky%20Train%2024th%20Street%20Station%20Interior.jpg',
    photoCaption: '24th St Station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://commons.wikimedia.org/wiki/Category:PHX_Sky_Train',
  },
  'Terminal 3 Station': {
    photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Phoenix-Sky%20Train%20-Terminal%203%20Sta..JPG',
    photoCaption: 'Terminal 3 Station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://commons.wikimedia.org/wiki/File:Phoenix-Sky_Train_-Terminal_3_Sta..JPG',
  },
  'Terminal 4 Station': {
    photoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Phoenix-Sky%20Train-Terminal%204%20Sta..JPG',
    photoCaption: 'Terminal 4 Station photo',
    photoCredit: 'Wikimedia Commons',
    photoSourceUrl: 'https://commons.wikimedia.org/wiki/Category:PHX_Sky_Train',
  },
}

export function getExistingTransitGeojson(city) {
  if (city === 'phoenix') return PHOENIX_EXISTING_TRANSIT
  return { type: 'FeatureCollection', features: [] }
}

export function getExistingTransitStationsGeojson(city) {
  if (city === 'phoenix') return PHOENIX_EXISTING_STATIONS
  return { type: 'FeatureCollection', features: [] }
}

export function getExistingStationPhoto(stationOrFeature) {
  if (!stationOrFeature) return null
  const station = stationOrFeature.properties || stationOrFeature
  return STATION_PHOTO_OVERRIDES[station.name] || null
}

export const EXISTING_TRANSIT_LEGEND = {
  phoenix: PHOENIX_EXISTING_TRANSIT.features.map((feature) => feature.properties),
}

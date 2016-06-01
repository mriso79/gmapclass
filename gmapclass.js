/*
 Classe JS Principal com os métodos para o mapa.
 */
function gMap()
{
    // Variavel global de objetos marcadores.
    var markers = [];
    var geocoder = new google.maps.Geocoder();
    var map;
    var latlng;
    var latlng_gal;
    var macount = 0;
    var ma = [];
    var directionDisplay;
    var directionsService = new google.maps.DirectionsService();
    var first_pos = null;
    var panoramioLayer = new google.maps.panoramio.PanoramioLayer();


    // infowindows
    var infowindow_ = new google.maps.InfoWindow({
        content: "loading..."
    });

    /* Endereços. pode (ou deve) ser gerada dinamicamente.

     Aqui os dados dos hotéis devem ser inseridos, bem como um HTML descritivo para a Janela de Informações
     Formatar os endereços em 1 (UMA) única linha


     */

    var addresses = [
        /* pegue do seu http.get  */
        {
            endereco: "R. Riachuelo, 201 - Centro Rio de Janeiro - RJ",
            titulo:   "RIO'S NICE HOTEL",
            descricao:"<b>RIO'S NICE HOTEL</b> <br/> HTML para o RIO'S NICE HOTEL",
            preco: "R$ XXXXX"
        },
        {
            endereco: "AVENIDA BEIRA MAR, 280, CENTRO 22021-060 RIO DE JANEIRO Brazil",
            titulo:   "Aeroporto Othon",
            descricao:"<b>Aeroporto Othon</b> <br/> HTML para o Aeroporto Othon",
            preco: "R$ XXXX"
        },
        {
            endereco: "RUA PAISSANDU, 23 FLAMENGO 22210-080 RIO DE JANEIRO BRASIL",
            titulo:   "Paysandu",
            descricao:"<b>Paysandu</b> <br/> HTML para o Hotel Paysandu",
            preco: "R$ XXXXX"
        },

        {
            endereco: "RUA PEDRO 1, 19 CENTRO RIO DE JANEIRO Brazil",
            titulo:   "Rio Presidente",
            descricao:"<b>Rio Presidente</b> <br/> HTML para o Rio Presidente",
            preco: "R$ XXXXXX"
        },
        {
            endereco: "RUA REPUBLICA DO PERU, 345 COPACABANA RIO DE JANEIRO BRAZIL",
            titulo:   "Astoria Copacabana",
            descricao:"<b>Astoria Copacabana</b> <br/> HTML para o Astoria Copacabana",
            preco: "R$ XXXXXX"
        }

    ];


    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        }
    }

    function calcRoute(pin, obj) {

        if(first_pos == null)
            first_pos = latlng;

        var start = first_pos;
        var end = pin;
        var request = {
            origin:start,
            destination:end,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);

                var route = response.routes[0];



                var summaryPanel = "";

                // For each route, display summary information.
                for (var i = 0; i < route.legs.length; i++) {
                    var routeSegment = i+1;
                    //summaryPanel.innerHTML += "<b>Route Segment: " + routeSegment + "</b><br />";
                    //summaryPanel.innerHTML += route.legs[i].start_address + " to ";
                    //summaryPanel.innerHTML += route.legs[i].end_address + "<br />";
                    summaryPanel += "Distância por carro: <br />" + route.legs[i].distance.text + "<br /><br />";
                }

                infowindow_.setContent(summaryPanel);
                infowindow_.position = pin;
                infowindow_.open(map, obj);

            }


        });
    }

    function placesSearch(pesquisa, radius)
    {
        removePlacesMarker();

        if(!pesquisa)
            pesquisa = 'restaurant';

        if(!radius)
            radius = 5000;

        if(first_pos == null)
            first_pos = latlng;

        var request = {
            location: first_pos,
            radius: radius,
            types: [pesquisa]
        };
        var service = new google.maps.places.PlacesService(map);
        service.search(request, callback);
    }


    function setPics()
    {

        panoramioLayer.setMap(map);
    }

    function hidePics()
    {
        panoramioLayer.setMap();
    }


    function createMarker(place) {

        var placeLoc = place.geometry.location;

        /*
         var icons = '';
         if(place.types[0] == 'gas_station')
         icons = '/assets/img/fillingstation.png';
         else if(place.types[0] == 'locksmith')
         icons = '/assets/img/tag.png';
         else if(place.types[0] == 'hospital')
         icons = '/assets/img/hospital.png';
         else if(place.types[0] == 'police')
         icons = '/assets/img/police.png';
         else if(place.types[0] == 'post_office')
         icons = '/assets/img/postal.png';
         else if(place.types[0] == 'restaurant' || place.types[0] == 'food' || place.types[0] == 'establishment')
         icons = '/assets/img/restaurant.png';
         */

        ma.push(new google.maps.Marker({
            map: map,
            position: place.geometry.location
            // ,icon: icons
        }));



        google.maps.event.addListener(ma[macount], 'click', function() {
            first_pos = this.position;
            infowindow_.setContent("<b>"+place.name+"</b> <p>"+place.vicinity+"</p>");
            infowindow_.open(map, this);
            streetView();
        });

        google.maps.event.addListener(ma[macount], 'dblclick', function () {
            first_pos = this.position;
        });
        google.maps.event.addListener(ma[macount], 'rightclick', function () {
            first_pos = this.position;
            calcRoute(placeLoc, this);
        });

        macount++;
    }



    /*
     Aqui começa a execução. Metodo equivalente ao "main()" do c++
     */
    function _initialize()
    {
        // Centralizado no Aeroporto Santos Dumont - definindo as latitudes
        latlng = new google.maps.LatLng(-22.911962,-43.167099);
        latlng_gal = new google.maps.LatLng(-22.811314,-43.248174); // Aeroporto Galeão:  -22.803402,-43.252882

        var rendererOptions = {
            draggable: true
        };

        directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);


        var myOptions = {
            zoom: 12,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: true
        };

        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        directionsDisplay.setMap(map);

        /*

         Adiciona marcadores dos Aeroportos
         Se você não quiser os aeroportos é só deletar esta seção.

         */

        // Adiciona santos Dumont
        markers.push(new google.maps.Marker({
            map: map,
            position: latlng,
            title: 'Aeroporto Santos Dumont',
            icon: '/img/airport.png',
            html: '<b>Aeroporto Santos Dumont</b> <br/> Info do Aeroporto'
        }));


        var marker = markers[0];
        google.maps.event.addListener(marker, 'click', function () {
            first_pos = this.position;
            infowindow_.setContent(this.html);
            infowindow_.open(map, this);
            streetView();
        });
        google.maps.event.addListener(marker, 'rightclick', function () {
            first_pos = this.position;
            calcRoute(placeLoc, this);
        });

        // Adiciona Galeão
        markers.push(new google.maps.Marker({
            map: map,
            position: latlng_gal,
            title: 'Aeroporto do Galeão',
            icon: '/img/airport.png',
            html: '<b>Aeroporto Galeão</b> <br/> Info do Aeroporto'
        }));


        var marker = markers[1];
        google.maps.event.addListener(marker, 'click', function () {
            first_pos = this.position;
            infowindow_.setContent(this.html);
            infowindow_.open(map, this);
            streetView();
        });
        google.maps.event.addListener(marker, 'rightclick', function () {
            first_pos = this.position;
            calcRoute(placeLoc, this);
        });

        /*

         Processa e adiciona os Endereços

         */

        _processAddresses();

    };


    function streetView()
    {
        if(first_pos == null)
            first_pos = latlng;

        var panoramaOptions = {
            position: first_pos,
            pov: {
                heading: 34,
                pitch: 10,
                zoom: 1
            }
        };
        var panorama = new  google.maps.StreetViewPanorama(document.getElementById("map_canvas2"), panoramaOptions);
        map.setStreetView(panorama);
    }




    /*
     executa o google geocoding para pesquisar a latitude e a longitude
     */
    function _processAddresses()
    {
        var address;

        for (var i = 0; i < addresses.length; i++) {

            (function(){
                address = addresses[i].endereco;
                var titulo = addresses[i].titulo;
                var descricao = addresses[i].descricao;
                var preco = addresses[i].preco;

                geocoder.geocode( { 'address': address }, function(results, status) {

                    var data = {};
                    data.titulo = titulo;
                    data.descricao = descricao;
                    data.preco = preco;

                    if (status == google.maps.GeocoderStatus.OK) {
                        position = results[0].geometry.location;

                        _addMarker(position, data, 'hotel');

                    }
                    else
                    {
                        console.log("Geocode was not successful for the following reason: " + status);
                    }
                });

            })();
        }
    }

    function _addMarker(position, data, type)
    {
        var usericon = '/img/hotel.png';

        markers.push(new google.maps.Marker({
            map: map,
            position: position,
            title: data.titulo,
            icon: usericon,
            html: data.descricao + "<br/> Preço: "+data.preco
        }));

        var cur = markers.length;
        cur--;

        var marker_ = markers[cur];
        google.maps.event.addListener(marker_, 'click', function () {
            first_pos = this.position;
            infowindow_.setContent(this.html);
            infowindow_.open(map, this);
            streetView();

        });

        google.maps.event.addListener(marker_, 'dblclick', function () {
            first_pos = this.position;
        });

        google.maps.event.addListener(marker_, 'rightclick', function () {
            first_pos = this.position;
            calcRoute(position, this);
        });


    };

    function removePlacesMarker()
    {
        for (var i = 0; i < ma.length; i++) {
            ma[i].setMap(null);
        }
    }

    /*
     Funções públicas que serão usadas para iniciar o mapa na página.
     */
    return {
        listeners: function()
        {

        },
        initmap: function()
        {
            _initialize();
            streetView();
        },
        pesquisa: function()
        {
            placesSearch($("#textpesq").val(), 9000)
        },
        limpar: function()
        {
            removePlacesMarker();
        },
        picOn: function()
        {
            setPics();
        },
        picOff: function()
        {
            hidePics();
        },
        sview: function()
        {
            streetView();
        }
    }
}

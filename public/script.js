var app = new Vue({
    el: '#app',
    data: {
        channels: [
            { "name": "Rock FM", "channelNumber": "12", "image": "rock-fm.png" },
            { "name": "Raadio 2", "channelNumber": "1", "image": "r2.png" },
            { "name": "Kuku", "channelNumber": "2", "image": "Raadio_Kuku.png" },
            { "name": "Sky+", "channelNumber": "4", "image": "Sky_Plus.png" },
            { "name": "Adore Jazz", "channelNumber": "5", "image": "adore.png" },
            { "name": "High Voltage", "channelNumber": "9", "image": "high_voltage.png" },
            { "name": "BBC Radio 1", "channelNumber": "10", "image": "BBC_Radio_1.svg" },
            { "name": "BBC Radio 2", "channelNumber": "11", "image": "BBC_Radio_2.svg" },
            { "name": "Vikerraadio", "channelNumber": "8", "image": "vikerraadio.png" }
        ],
        powerState: "STANDBY",
        stateLoading: false,
        artist: "LOADING...",
        track: "",
        volume: 0,
        volMax: 10
    },
    methods: {
        //https://learnwithparam.com/blog/how-to-handle-fetch-errors/
        //fetch vajab täiendamist
        changeChannel: function (channelNumber) {
            fetch('/api/favourite/' + channelNumber);
        },
        togglePower: function () {
            if (this.powerState == "ON") {
                fetch('/api/power/off');
            } else {
                fetch('/api/power/on');
                this.stateLoading = true;
            }
        },
        setVolume: function (value) {
            if (value > this.volMax) {
                value = this.volMax;
            } else if (value < 0) {
                value = 0;
            }
            this.volume = value;
            fetch('/api/volume/' + value);

        },
        loadData: function () {
            fetch('/api/status').then(response => response.json()).then(data => {
                if (data.power == "ON") {
                    this.stateLoading = false;
                }
                this.powerState = data.power;
                this.volume = data.volume;
                this.artist = data.artist
                this.track = data.track;
            });
        }
    },
    mounted: function () {
        this.loadData();
        setInterval(function () {
            this.loadData();
        }.bind(this), 1000);
    },
    vuetify: new Vuetify()
})
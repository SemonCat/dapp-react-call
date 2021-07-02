import * as React from "react";
import {
    Card,
    CardText,
    CardBody,
    CardTitle,
    CardSubtitle,
    Button,
} from "reactstrap";
import Decall from "../api/Decall";

var uniqid = require("uniqid");

const sleep = (m) => new Promise((r) => setTimeout(r, m));

class Call extends React.Component {
    constructor(props) {
        super(props);

        console.log(this.props.callContract);

        this.roomId = this.props.roomId;
        this.userId = uniqid();

        this.DecallApi = new Decall({
            contract: this.props.callContract,
            roomId: this.roomId,
            userId: this.userId,
        });

        this.localVideo = React.createRef();
        this.remoteVideo = React.createRef();

        this.state = {
            userId: this.userId,
            otherSide: null,
        };
    }

    async componentDidMount() {
        const members = await this.DecallApi.getParticipants(this.roomId);
        console.log("members");
        console.log(members);
    }

    async joinRoom() {
        await this.DecallApi.join();
        const members = await this.DecallApi.getParticipants(this.roomId);
        console.log("members");
        console.log(members);
    }

    async makeCall() {
        this.setupPC();
    }

    async setupPC() {
        await this.startCamera();
        this.pc = new RTCPeerConnection({
            iceServers: [{ url: "stun:stun.l.google.com:19302" }],
        });

        this.pc.ontrack = (e) => {
            console.log("ontrack");
            console.log(e);
            this.remoteVideo.current.srcObject = e.streams[0];
        };
        this.pc.oniceconnectionstatechange = (e) => {
            console.log("iceconnectionstatechange:" + e);
        };

        this.localStream
            .getTracks()
            .forEach((track) => this.pc.addTrack(track, this.localStream));

        await this.DecallApi.join();

        var members = await this.DecallApi.getParticipants();

        console.log("members");
        console.log(members);

        if (members.length == 1) {
            console.log("offer");
            this.offer();
        } else {
            console.log("answer");
            this.answer();
        }
    }

    async offer() {
        const offer = await this.pc.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        });
        await this.pc.setLocalDescription(offer);
        await sleep(500);

        await this.DecallApi.putSDP(JSON.stringify(this.pc.localDescription));
        console.log("offer done");
        this.waitAnswer();
    }

    async waitAnswer() {
        console.log("waitAnswer");
        var members = await this.DecallApi.getParticipants();

        members = members.filter((e) => e !== "" && e !== this.userId);

        if (members.length <= 0) {
            console.log("member not enough");
            setTimeout(() => this.waitAnswer(), 1000);
            return;
        }

        const callee = members[0];
        this.setState({
            otherSide: callee,
        });

        // fetch answer sdp
        const sdp = await this.DecallApi.getSDP(callee);

        console.log("sdp");
        console.log(sdp[1]);
        if (!sdp[1]) {
            console.log("sdp not ready");
            setTimeout(() => this.waitAnswer(), 1000);
            return;
        }
        const remoteSDP = JSON.parse(sdp[1]);

        console.log("remoteSDP");
        console.log(remoteSDP);

        this.pc.setRemoteDescription(remoteSDP);
    }

    async answer() {
        var members = await this.DecallApi.getParticipants();

        members = members.filter((e) => e !== "" && e !== this.userId);

        if (members.length <= 0) {
            console.log("member not enough");
            return;
        }

        const caller = members[0];
        this.setState({
            otherSide: caller,
        });

        // fetch offer sdp
        const sdp = await this.DecallApi.getSDP(caller);

        console.log("sdp");
        console.log(sdp[1]);
        const remoteSDP = JSON.parse(sdp[1]);
        this.pc.setRemoteDescription(remoteSDP);
        const answerSDP = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answerSDP);
        console.log(answerSDP);

        await sleep(500);
        await this.DecallApi.putSDP(JSON.stringify(this.pc.localDescription));

        console.log("answer done");
    }

    async startCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        console.log("Received local stream");
        console.log(this.localVideo);
        this.localVideo.current.srcObject = stream;
        this.localStream = stream;
    }

    render() {
        return (
            <div>
                <Card>
                    <CardBody>
                        <CardTitle tag="h5">
                            UserId: {this.state.userId}
                        </CardTitle>
                        <CardSubtitle tag="h6" className="mb-2 text-muted">
                            Self
                        </CardSubtitle>
                        <video
                            id="localVideo"
                            width="640"
                            height="320"
                            ref={this.localVideo}
                            playsInline
                            autoPlay
                            muted
                            disablePictureInPicture
                        />
                        <br />
                        <Button onClick={this.makeCall.bind(this)}>Join</Button>
                    </CardBody>
                </Card>

                <br />

                {this.state.otherSide ? (
                    <Card>
                        <CardBody>
                            <CardTitle tag="h5">
                                UserId: {this.state.otherSide}
                            </CardTitle>
                            <video
                                id="remoteVideo"
                                width="640"
                                height="320"
                                ref={this.remoteVideo}
                                playsInline
                                autoPlay
                            />
                        </CardBody>
                    </Card>
                ) : null}
            </div>
        );
    }
}

export default Call;

import React, { Component } from "react";
import Particles from "react-particles-js";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Navigation from "./components/Navigation/Navigation";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import Profile from './components/Profile/Profile';
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import Modal from "./components/Modal/Modal";
import "./App.css";

const particlesOptions = {
	particles: {
		number: {
			value: 30,
			density: {
				enable: true,
				value_area: 800,
			},
		},
	},
};

const initialState = {
	input: "",
	imageUrl: "",
	boxes: [],
	route: "signin",
	isSignedIn: true,
	isProfileOpen: false,
	user: {
		id: "",
		name: "",
		email: "",
		entries: 0,
        joined: "",
        pet: "",
        age: ""
	},
};

class App extends Component {
	constructor() {
		super();
		this.state = initialState;
	}

    componentDidMount() {
        const token = window.sessionStorage.getItem('token');
        if(token) {
            fetch('http://localhost:3000/signin', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            })
            .then(resp => resp.json())
            .then(data => {
                console.log("dx", data)
                if(data && data.userId) {
                    console.log('success now getting user profile');
                    fetch(`http://localhost:3000/profile/${data.userId}`, {
                        method: 'get',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token
                        }
                    })
                    .then(resp => resp.json())
                    .then(user => {
                        if(user && user.email) {
                            this.loadUser(user);
                            this.onRouteChange('home');
                        }
                    })
                }
            }).catch(console.log('err'))
        }
    }
    
	loadUser = (data) => {
		this.setState({
			user: {
				id: data.id,
				name: data.name,
				email: data.email,
				entries: data.entries,
				joined: data.joined,
			},
		});
	};

	calculateFaceLocation = (data) => {
		if (data && data.outputs && "regions" in data.outputs[0].data) {
			const clarifaiFace = data.outputs[0].data.regions;
			const image = document.getElementById("inputimage");
			const width = Number(image.width);
			const height = Number(image.height);
			const faceBoxes = clarifaiFace.map((face) => {
				let faceBox = face.region_info.bounding_box;
				return {
					leftCol: faceBox.left_col * width,
					topRow: faceBox.top_row * height,
					rightCol: width - faceBox.right_col * width,
					bottomRow: height - faceBox.bottom_row * height,
				};
			});
			return faceBoxes;
		}
		return [];
	};

	displayFaceBox = (boxes) => {
		this.setState({ boxes });
	};

	onInputChange = (event) => {
		this.setState({ input: event.target.value });
	};

	onButtonSubmit = () => {
		this.setState({ imageUrl: this.state.input });
		fetch("http://localhost:3000/imageurl", {
			method: "post",
            headers: { 
                "Content-Type": "application/json", 
                'Authorization': window.sessionStorage.getItem('token')
            },
			body: JSON.stringify({
				input: this.state.input,
			}),
		})
			.then((response) => response.json())
			.then((response) => {
				if (response) {
					fetch("http://localhost:3000/image", {
						method: "put",
                        headers: { 
                            "Content-Type": "application/json",
                            'Authorization': window.sessionStorage.getItem('token')
                        },
						body: JSON.stringify({
							id: this.state.user.id,
						}),
					})
						.then((response) => response.json())
						.then((count) => {
							this.setState(Object.assign(this.state.user, { entries: count }));
						})
						.catch(console.log);
				}
				this.displayFaceBox(this.calculateFaceLocation(response));
			})
			.catch((err) => console.log(err));
	};

	onRouteChange = (route) => {
		if (route === "signout") {
			this.setState(initialState);
		} else if (route === "home") {
			this.setState({ isSignedIn: true });
		}
		this.setState({ route: route });
	};

	toggleModal = () => {
		this.setState({
			isProfileOpen: !this.state.isProfileOpen,
		});
	};

	render() {
		const { isSignedIn, imageUrl, route, boxes, isProfileOpen, user } = this.state;
		return (
			<div className="App">
				<Particles className="particles" params={particlesOptions} />
				<Navigation
					isSignedIn={isSignedIn}
					onRouteChange={this.onRouteChange}
					toggleModal={this.toggleModal}
				/>
				{isProfileOpen && (
					<Modal>
						<Profile
                            loadUser={this.loadUser}
							isProfileOpen={isProfileOpen}
                            toggleModal={this.toggleModal}
                            user={user}
						/>
					</Modal>
				)}
				{route === "home" ? (
					<div>
						<Logo />

						<Rank
							name={this.state.user.name}
							entries={this.state.user.entries}
						/>
						<ImageLinkForm
							onInputChange={this.onInputChange}
							onButtonSubmit={this.onButtonSubmit}
						/>
						<FaceRecognition boxes={boxes} imageUrl={imageUrl} />
					</div>
				) : route === "signin" ? (
					<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
				) : (
					<Register
						loadUser={this.loadUser}
						onRouteChange={this.onRouteChange}
					/>
				)}
			</div>
		);
	}
}

export default App;

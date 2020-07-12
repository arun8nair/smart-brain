import React from "react";
import "./Profile.css";

class Profile extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.name,
            age: this.props.age,
            pet: this.props.pet
        }
    }

    onFormChange = (event) => {
        const { name, value} = event.target; 
        this.setState({ [name]: value})
    }

    onProfileUpdate = (data) => {
        fetch(`http://localhost:3000/profile/${this.props.user.id}`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('token')
            },
            body: JSON.stringify({ formInput: data })
        }).then(resp => {
            if(resp.status === 200 || resp.status === 304) {
                this.props.toggleModal();
                this.props.loadUser({...this.props.user, ...data});   
            }
            this.props.toggleModal();
            this.props.loadUser({...this.props.user, ...data});
        })
    }

    render() {
        const { name, age, pet } = this.state;
        const { user, toggleModal } = this.props;
        return (
            <div className="profile-modal">
                <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center bg-white">
                    <main className="pa4 black-80">
                        <img
                            src="http://tachyons.io/img/logo.jpg"
                            className="h3 w3 dib"
                            alt="avatar"
                        />
                        <h1>{user.name}</h1>
                        <h4>{`Images submitted: ${user.entries}`}</h4>
                        <p>{`Member since: ${new Date(user.joined).toLocaleDateString()}`}</p>
                        <hr></hr>
                        <label className="db fw6 lh-copy f6" htmlFor="username">
                            Name:
                        </label>
                        <input
                            className="pa2 input-reset ba bg-transparent hover-bg-black hover-black w-100"
                            type="text"
                            onChange={this.onFormChange}
                            placeholder={user.name}
                            name="name"
                            id="name"
                        />
                        <label className="db fw6 lh-copy f6" htmlFor="user-age">
                            Age:
                        </label>
                        <input
                            className="pa2 input-reset ba bg-transparent hover-bg-black hover-black w-100"
                            type="text"
                            onChange={this.onFormChange}
                            placeholder={user.age}
                            name="age"
                            id="age"
                        />
                        <label className="db fw6 lh-copy f6" htmlFor="username">
                            Pet:	
                        </label>
                        <input
                            className="pa2 input-reset ba bg-transparent hover-bg-black hover-black w-100"
                            type="text"
                            onChange={this.onFormChange}
                            placeholder={user.pet}
                            name="pet"
                            id="pet"
                        />
                        <div className="mt4" style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            <button onClick={() => this.onProfileUpdate({ name, age, pet})}>Save</button>
                            <button onClick={toggleModal}>Cancel</button>
                        </div>
                    </main>
                    <div className="modal-close fs20" onClick={toggleModal}>&times;</div>
                </article>
            </div>
        );
    }
}

export default Profile;

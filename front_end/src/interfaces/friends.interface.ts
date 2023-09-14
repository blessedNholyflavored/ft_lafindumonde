export default interface Friend {
	id: number;
	username: string;
};


export default interface Friendrequest {
	id: number;
	status: string;
	senderId: number;
	recipientId: number;
};
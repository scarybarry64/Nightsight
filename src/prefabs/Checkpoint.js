class Checkpoint{
    constructor(scene, x, y, player){
        this.active = false;
        this.player = player;
        this.x = x;
        this.y = y;

        //add object to existing scene, displayList, updateList
        scene.add.existing(this);
    }

    update(){
        //Check if the given player object makes contact with the checkpoint
        if(this.player.x < this.x + 55 && this.player.x > this.x - 55) {
            if(this.player.y < this.y + 20 && this.player.y > this.y - 20) {
                console.log("player reached checkpoint");
                this.tempx = localStorage.getItem('checkpointx');
                this.tempy = localStorage.getItem('checkpointy');
                console.log(typeof this.tempy);
                //console.log("tempx = " + this.tempx);

                //Change the stored checkpoint x and y if there is no previous reached checkpoints
                //or if the current checkpoint is the most advanced
                if(this.y < this.tempy || this.tempy == null){
                    localStorage.setItem('checkpointx', this.x);
                    localStorage.setItem('checkpointy', this.y);
                    console.log("changed checkpoint");
                }
            }
        }
    }
}
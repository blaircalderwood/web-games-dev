# web-games-dev

Turnip Wars is an online two player top down 2D tower defence game. The main idea of the game is to manage your funds to purchase turrets or turnips and try to destroy the enemies’ base while keeping yours safe. 

The turnips will spawn wherever the player has pressed in their half of the environment. They will then navigate their way to the enemies’ base using the A* path-finding algorithm where they will take health away from the opposing player. 

The player can also purchase turrets to defend their base from turnips by selecting predetermined areas of the map set out by the developers and pressing build. 

The turrets are only used as a defence mechanism and cannot be used to damage the enemy player’s base. They will fire upon any enemy turnips that enter their half of the environment. After the turnip has been shot they will be destroyed.

The first player to lose all of their health loses. 

The players will have to manage their funds smartly and select their turret positions and turnip spawn points with care if they are to outdo the opposing player.

#Mechanics 

●	Each player will start with 1000 credits

●	Every two seconds twenty credits will be added to the players funds (Keeps flow of the game moving)

●	Turrets cost 300 credits

●	Turnips cost 50 credits

●	Destroying a turnip adds five credits to funds

●	A turnip that collides with the enemy base subtracts twenty from one hundred health and earns that player an additional 100 credits

●	A turnip will be destroyed after being hit by an enemy bullet. 

●	Winning condition: Opposing players base health falls below zero

●	Losing condition: Players base health falls below zero

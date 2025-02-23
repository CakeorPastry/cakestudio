local Players = game:GetService("Players") 

local Player = Players.LocalPlayer
local Character = Player.Character or Player.CharacterAdded:Wait() 
local HumanoidRootPart = Character:WaitForChild("HumanoidRootPart")
local Humanoid = Character:WaitForChild("Humanoid") 

local exits = {
    [0] = Vector3.new(-902.1170654296875, 11.285065650939941, -92.56808471679688), 
    [1] = 
}

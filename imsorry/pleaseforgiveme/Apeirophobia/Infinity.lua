local Players = game:GetService("Players") 

local Player = Players.LocalPlayer
local Character = Player.Character or Player.CharacterAdded:Wait() 
local HumanoidRootPart = Character:WaitForChild("HumanoidRootPart")
local Humanoid = Character:WaitForChild("Humanoid") 

local exits = {
    [0] = Vector3.new(-902.1170654296875, 11.285065650939941, -92.56808471679688), 
    [1] = Vector3.new(-793.73486328125, -147.79653930664062, -1067.9468994140625), 
    [2] = Vector3.new(-652.2662963867188, -308.5695495605469, -2364.93896484375), 
    [3] = Vector3.new(602.577880859375, 6.558300971984863, -108.53520965576172), 
    [4] = Vector3.new(-289.4031982421875, 202.6591796875, 1225.1724853515625), 
    [5] = Vector3.new(-609.9652099609375, 10.679997444152832, 3556.015869140625), 
    [6] = Vector3.new(720.712646484375, 6.783085823059082, -2330.336181640625)
}


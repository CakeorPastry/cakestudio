local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local StarterGui = game:GetService("StarterGui")
local TweenService = game:GetService("TweenService") 

local TweenInfo = TweenInfo.new(1, Enum.EasingStyle.Linear)
local Player = Players.LocalPlayer
local Character = Player.Character or Player.CharacterAdded:Wait()
local CanTP = true

-- 🔔 Notification Function
function Notify(title, text, duration, button1)
    StarterGui:SetCore("SendNotification", {
        Title = title,
        Text = text,
        Duration = duration or 10,
        Button1 = button1 or nil
    })
end

-- 🎯 Fetches the Player's Current ID
local function FetchCurrentId(Map, SpecifiedClient)
    if not Map then return end
    for _, v in Map:GetChildren() do
        if v.Name == "Id" and v:FindFirstChild("SurfaceGui") then
            local frame = v.SurfaceGui:FindFirstChild("Frame")
            if frame and frame:FindFirstChild("PlayerName") then
                if (frame.PlayerName.Text == SpecifiedClient.Name or frame.PlayerName.Text == SpecifiedClient.DisplayName) and v.SurfaceGui.Enabled then
                    return v
                end
            end
        end
    end
end

-- 🕵️‍♂️ Finds the Closest Player
local function closestPlayerAtPos(Position)
    local MaxRange = math.huge
    local Closest = nil

    for _, v in Players:GetPlayers() do
        local RootPart = v.Character and v.Character:FindFirstChild("HumanoidRootPart")
        if RootPart and v ~= Player then
            local Magnitude = (RootPart.Position - Position).Magnitude
            if Magnitude < MaxRange then
                Closest = v
                MaxRange = Magnitude
            end
        end
    end
    return Closest
end

-- 🎛 Adjusts Prompt Properties
local function FiddleWithPrompts(Map)
    if not Map then return end
    for _, v in Map:GetChildren() do
        if v.Name == "Id" or v.Name == "Crate" then
            if v:FindFirstChild("IdPrompt") then
                v.IdPrompt.HoldDuration = 0
                v.IdPrompt.MaxActivationDistance = math.huge
                v.IdPrompt.RequiresLineOfSight = false
            end
        end
    end
end

-- 🚀 Teleport Function (With Tweening Support)
local function TP(target, destination, tween)
    if target and destination and target:FindFirstChild("HumanoidRootPart") then
        if tween then
            local Tween = TweenService:Create(target.HumanoidRootPart, TweenInfo, {CFrame = destination.CFrame})
            Tween:Play() 
            Tween.Completed:Wait() 
        else
            target.HumanoidRootPart.CFrame = destination.CFrame
        end
    end
end

-- 📜 Processes User Commands
function ProcessCommand(command)
    if command == "" then return end
    if not command:match("^/") then
        command = "/" .. command
    end

    local args = string.split(command, " ")
    local mainCmd = string.lower(args[1])
    local fullyLowered = string.lower(command)
    local spookParam = string.find(fullyLowered, "?spook")
    local tweenParam = string.find(fullyLowered, "?tween")

    if mainCmd == "/myid" then
        local CurrentUserId = FetchCurrentId(workspace.Map, Player)
        if CurrentUserId and Character then
            TP(Character, CurrentUserId)
        else
            Notify("ID Not Found", "Your ID couldn't be found in the game", 5, "💀")
        end

    elseif mainCmd == "/idtp" then
        CanTP = true
        local playerCFrame = Character.HumanoidRootPart.CFrame
        for _, player in Players:GetPlayers() do
            if not CanTP then break end
            local ID = FetchCurrentId(workspace.Map, player)
            if ID and Character then
                TP(Character, ID, tweenParam and true or false)
                task.wait(2)
            end
            if spookParam then
                Character.HumanoidRootPart.CFrame = playerCFrame
            end
        end

    elseif mainCmd == "/abortidtp" then
        CanTP = false
        Notify("Abort ID Teleport", "Aborted ID Teleport", 5, ";)")

    elseif mainCmd == "/fiddlewithprompts" then
        FiddleWithPrompts(workspace.Map)

    elseif mainCmd == "/closestplayer" then
        local closestPlayer = closestPlayerAtPos(Character.HumanoidRootPart.Position)
        if closestPlayer then
            Notify("Closest Player", closestPlayer.Name, 10, "🔥")
            if tweenParam and closestPlayer.Character and closestPlayer.Character:FindFirstChild("HumanoidRootPart") then
                TP(Character, closestPlayer.Character.HumanoidRootPart, true)
            end
        else
            Notify("Closest Player", "No players found", 5, "❌")
        end
    end
end

-- 🎨 GUI Creation
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Parent = game.CoreGui

local Frame = Instance.new("Frame")
Frame.Size = UDim2.new(0, 250, 0, 60) -- Increased Frame Size
Frame.Position = UDim2.new(0.5, -225, 0.1, 0)
Frame.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
Frame.BorderSizePixel = 2
Frame.Active = true
Frame.Parent = ScreenGui

local TextBox = Instance.new("TextBox")
TextBox.Size = UDim2.new(1, -40, 1, -45)
TextBox.Position = UDim2.new(0, 20, 0, 25)
TextBox.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
TextBox.TextColor3 = Color3.fromRGB(255, 255, 255)
TextBox.PlaceholderText = "Enter command..."
TextBox.TextScaled = true
TextBox.ClearTextOnFocus = false
TextBox.Parent = Frame
TextBox.RichText = true
TextBot.Text = '/commandname <FONT COLOR="rgb(255, 0, 0)"><argument1></FONT><FONT COLOR="rgb(0, 255, 0)">[argument2]</FONT><FONT COLOR="rgb(0, 0, 255)">[PARAMETERS]</FONT>'

TextBox.FocusLost:Connect(function(enterPressed)
    if enterPressed and TextBox.Text ~= "" then
        ProcessCommand(TextBox.Text)
        TextBox.Text = ""
    end
end)

-- 🎭 GUI Dragging Fix
local dragging, dragInput, dragStart, startPos = false, nil, nil, nil

local function update(input)
    if dragging then
        local delta = input.Position - dragStart
        Frame.Position = UDim2.new(
            startPos.X.Scale, startPos.X.Offset + delta.X,
            startPos.Y.Scale, startPos.Y.Offset + delta.Y
        )
    end
end

Frame.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        dragging = true
        dragStart = input.Position
        startPos = Frame.Position
        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then
                dragging = false
            end
        end)
    end
end)

Frame.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
        dragInput = input
    end
end)

UserInputService.InputChanged:Connect(function(input)
    if input == dragInput and dragging then
        update(input)
    end
end)

-- 🎉 Notify Script Loaded
Notify("Script Loaded", "Fixed GUI dragging & increased size!", 10, "Enjoy!")

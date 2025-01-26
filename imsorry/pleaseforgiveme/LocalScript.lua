local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local StarterGui = game:GetService("StarterGui")
local TweenService = game:GetService("TweenService")

local Player = Players.LocalPlayer
local Character = Player.Character or Player.CharacterAdded:Wait()
local TweenInfo = TweenInfo.new(1, Enum.EasingStyle.Linear)
local CanTP = true

-- Update Character Reference on Respawn
local function onCharacterAdded(newCharacter)
    Character = newCharacter
end
Player.CharacterAdded:Connect(onCharacterAdded)

-- Notification Function
function Notify(title, text, duration, button1)
    StarterGui:SetCore("SendNotification", {
        Title = title,
        Text = text,
        Duration = duration or 10,
        Button1 = button1 or nil
    })
end

-- Fetches the Player's Current ID
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

-- Finds the Closest Player
local function closestPlayerAtPos(Position)
    local Closest, MaxRange = nil, math.huge
    for _, v in Players:GetPlayers() do
        if v ~= Player and v.Character and v.Character:FindFirstChild("HumanoidRootPart") then
            local Distance = (v.Character.HumanoidRootPart.Position - Position).Magnitude
            if Distance < MaxRange then
                Closest, MaxRange = v, Distance
            end
        end
    end
    return Closest
end

-- Adjusts Prompt Properties
local function FiddleWithPrompts(Map)
    if not Map then return end
    for _, v in Map:GetChildren() do
        if v.Name == "Id" or v.Name == "Crate" then
            local prompt = v:FindFirstChild("IdPrompt")
            if prompt then
                prompt.HoldDuration = 0
                prompt.MaxActivationDistance = math.huge
                prompt.RequiresLineOfSight = false
            end
        end
    end
end

-- Teleport Function (with Tween Support)
local function TP(target, destination, tween)
    if target and destination and target:FindFirstChild("HumanoidRootPart") then
        if tween then
            local Tween = TweenService:Create(target.HumanoidRootPart, TweenInfo, {CFrame = destination.CFrame})
            Tween:Play()
        else
            target.HumanoidRootPart.CFrame = destination.CFrame
        end
    end
end

-- Processes Commands from GUI Input
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
            if not CanTP then
                Notify("Teleportation Aborted", "You stopped ID teleportation.", 5, "❌")
                break
            end
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

-- GUI Creation
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Parent = game.CoreGui

local Frame = Instance.new("Frame")
Frame.Size = UDim2.new(0, 350, 0, 60)
Frame.Position = UDim2.new(0.5, -175, 0.1, 0)
Frame.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
Frame.BorderSizePixel = 2
Frame.Active = true
Frame.Parent = ScreenGui

local TextBox = Instance.new("TextBox")
TextBox.Size = UDim2.new(1, -10, 1, -10)
TextBox.Position = UDim2.new(0, 5, 0, 5)
TextBox.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
TextBox.TextColor3 = Color3.fromRGB(255, 255, 255)
TextBox.PlaceholderText = "Enter command..."
TextBox.TextScaled = true
TextBox.ClearTextOnFocus = false
TextBox.Parent = Frame

TextBox.FocusLost:Connect(function(enterPressed)
    if enterPressed and TextBox.Text ~= "" then
        ProcessCommand(TextBox.Text)
        TextBox.Text = ""
    end
end)

-- GUI Dragging Functionality
local dragging, dragInput, dragStart, startPos

local function update(input)
    if startPos then
        local delta = input.Position - dragStart
        Frame.Position = UDim2.new(
            startPos.X.Scale, startPos.X.Offset + delta.X,
            startPos.Y.Scale, startPos.Y.Offset + delta.Y
        )
    end
end

Frame.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 then
        dragging, dragStart, startPos = true, input.Position, Frame.Position
        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then
                dragging = false
            end
        end)
    end
end)

Frame.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseMovement then
        dragInput = input
    end
end)

UserInputService.InputChanged:Connect(function(input)
    if input == dragInput and dragging then
        update(input)
    end
end)

-- Notify Script Loaded
Notify("Script Loaded", "Updated version with bug fixes and improvements.", 10, "Enjoy!")

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local StarterGui = game:GetService("StarterGui")
local TweenService = game:GetService("TweenService") 
local TweenInfo = TweenInfo.new(1, Enum.EasingStyle.Linear)

local Player = Players.LocalPlayer
local Character = Player.Character or Player.CharacterAdded:Wait()
local CanTP = true

function Notify(title, text, duration, button1)
    StarterGui:SetCore("SendNotification", {
        Title = title,
        Text = text,
        Duration = duration or 10,
        Button1 = button1 or nil
    })
end

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

local function closestPlayerAtPos(Position)
    local MaxRange = math.huge
    local Closest = nil

    for _, v in Players:GetPlayers() do
        local RootPart = v.Character and v.Character:FindFirstChild("HumanoidRootPart")
        if RootPart and v ~= Player then
            local Magnitude = (RootPart.Position - Position).Magnitude
            if Magnitude < MaxRange then
                Closest = v.Name
                MaxRange = Magnitude
            end
        end
    end
    return Closest
end

local function FillStashList(Map)
    local StashList = {}
    if not Map then return StashList end
    for _, v in workspace.Map:GetChildren() do
        if v.Name == "Crate" then
            table.insert(StashList, v)
        end
    end
    return StashList
end

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
      Notify("Closest Player", closestPlayer, 10, "🔥")
if tweenParam then
    TP(Character, Players:FindFirstChild(closestPlayer).Character.HumanoidRootPart or Character.HumanoidRootPart, true)
end
    end
end

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Parent = game.CoreGui

local Frame = Instance.new("Frame")
Frame.Size = UDim2.new(0, 350, 0, 60)
Frame.Position = UDim2.new(0.5, -175, 0.1, 0)
Frame.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
Frame.BorderSizePixel = 2
Frame.Active = true
Frame.Draggable = false
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
TextBox.Text = "/commandname <argument1> [argument2] ..."

TextBox.FocusLost:Connect(function(enterPressed)
    if enterPressed then
        local command = TextBox.Text
        if command ~= "" then
            ProcessCommand(command)
            TextBox.Text = ""
        end
    end
end)

local dragging = false
local dragInput, dragStart, startPos

local function update(input)
    local delta = input.Position - dragStart
    Frame.Position = UDim2.new(
        startPos.X.Scale, startPos.X.Offset + delta.X,
        startPos.Y.Scale, startPos.Y.Offset + delta.Y
    )
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

Notify("Script Loaded", "First version btw alot of bugs, just ask the creator for the list of commands", 10, "thank you my goat")

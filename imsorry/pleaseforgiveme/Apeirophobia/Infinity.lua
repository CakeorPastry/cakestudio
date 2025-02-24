local Players = game:GetService("Players") 
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local Player = Players.LocalPlayer
local Character = Player.Character or Player.CharacterAdded:Wait() 
local HumanoidRootPart = Character:WaitForChild("HumanoidRootPart")
local Humanoid = Character:WaitForChild("Humanoid") 

local GameSettings = ReplicatedStorage:WaitForChild("GameSettings")
local currentLevel = GameSettings:WaitForChild("currentLevel")
local gamemode = GameSettings:WaitForChild("gamemode")
local infiniteMode = GameSettings:WaitForChild("infinitemode")
local gameReady = GameSettings:WaitForChild("gameReady")
local isCutscene = Character:WaitForChild("Scripts"):WaitForChild("vars"):WaitForChild("isCutscene")
local canAuto = false
local TweenInfoSetting = TweenInfo.new(1, Enum.EasingStyle.Linear)

local exits = {
    [0] = Vector3.new(-902.1170654296875, 11.285065650939941, -92.56808471679688), 
    [1] = Vector3.new(-793.73486328125, -147.79653930664062, -1067.9468994140625), 
    [2] = Vector3.new(-652.2662963867188, -308.5695495605469, -2364.93896484375), 
    [3] = Vector3.new(602.577880859375, 6.558300971984863, -108.53520965576172), 
    [4] = Vector3.new(-289.4031982421875, 202.6591796875, 1225.1724853515625), 
    [5] = Vector3.new(-609.9652099609375, 10.679997444152832, 3556.015869140625), 
    [6] = Vector3.new(720.712646484375, 6.783085823059082, -2330.336181640625)
}

local function Start() 
    if not canAuto then return end
    local connection
    connection = RunService.Heartbeat:Connect(function()
        if infiniteMode.Value ~= true then
            task.spawn(function()
                CreateNotification("Gamemode isn't Infinity.", Color3.new(255, 0, 0), 5)
            end)
            connection:Disconnect()
            canAuto = false
            return
        end
        if not canAuto then connection:Disconnect() return end
        if isCutscene.Value == true then 
            repeat
                keypress(0x20)
                task.wait(0.1)
            until isCutscene.Value == false
        end
        local findLevel = exits[currentLevel.Value]
        if findLevel then
            local Tween = TweenService:Create(HumanoidRootPart, TweenInfoSetting, { Position = findLevel })
            Tween:Play()
            Tween.Completed:Wait()
        end
    end)
end

-- 🔔 Notification Function
function Notify(title, text, duration, button1)
    StarterGui:SetCore("SendNotification", {
        Title = title,
        Text = text,
        Duration = duration or 10,
        Button1 = button1
    })
end

function PlaySound(id) 
    local Sound = Instance.new("Sound")
    local finalId = id or "97495881842727"
    Sound.SoundId = "rbxassetid://"..finalId
    -- "DO NOT REDEEM" Meme Btw
    Sound.Parent = workspace
    Sound:Play() 
    Sound.Ended:Wait() 
    Sound:Destroy()
end

function ProcessCommand(command)
    if command == "" then return end
    if not command:match("^/") then
        command = "/" .. command
    end

    local args = string.split(command, " ")
    local mainCmd = string.lower(args[1])
    
    local arguments = {table.unpack(args, 2)}
    local fullyLowered = string.lower(command)

    if mainCmd == "/start" then
        canAuto = true
        task.spawn(function()
            CreateNotification("Started Auto Infinity.", Color3.new(0, 255, 0), 5)
        end) 
        Start()
    elseif mainCmd == "/stop" then
        task.spawn(function()
            CreateNotification("Stopped Auto Infinity.", Color3.new(0, 255, 0), 5)
        end)
        --Stop()
        canAuto = false
    end
end

-- 🎨 GUI Creation
-- Command Bar
local ScreenGui = Instance.new("ScreenGui")
-- ScreenGui.Name = "ꯂꯋꯥꯏ ꯃꯆꯥ"
ScreenGui.Name = "Apeiro"
ScreenGui.Parent = game.CoreGui
ScreenGui.IgnoreGuiInset = true
ScreenGui.ScreenInsets = Enum.ScreenInsets.DeviceSafeInsets

local Frame = Instance.new("Frame")
Frame.Size = UDim2.new(0, 250, 0, 60)
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

-- Notification Gui
-- Create the ScreenGui
-- local notificationGui = Instance.new("ScreenGui")
-- notificationGui.Parent = game.CoreGui

-- Create the Frame
local notificationFrame = Instance.new("Frame")
notificationFrame.Size = UDim2.new(0, 626, 0, 59)
notificationFrame.Position = UDim2.new(0.5, 0, 0.268415093, 0)
notificationFrame.AnchorPoint = Vector2.new(0.5, 0.5)
notificationFrame.BackgroundTransparency = 1
notificationFrame.Parent = ScreenGui
notificationFrame.Name = "Output"

-- Add UIGridLayout
local gridLayout = Instance.new("UIGridLayout")
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
gridLayout.StartCorner = Enum.StartCorner.TopLeft
gridLayout.CellPadding = UDim2.new(0, 0, 0, 0)
gridLayout.CellSize = UDim2.new(1, 0, 0.349999994, 0) -- Matching the TextLabel size
gridLayout.Parent = notificationFrame

local sampleText = '/commandname <font color="rgb(255, 0, 0)">&lt;argument1&gt;</font><font color="rgb(0, 255, 0)">[argument2]</font><font color="rgb(0, 0, 255)">[PARAMETERS]</font>'
local sampleTextRaw = "/commandname <argument1> [argument2] [PARAMETERS]"
TextBox.Text = sampleText

-- Function to create notifications
function CreateNotification(text, color, duration)
    local notification = Instance.new("TextLabel")
    notification.Size = UDim2.new(1, 0, 1, 0)
    notification.AnchorPoint = Vector2.new(0.5, 0, 0.5, 0)
    notification.Position = UDim2.new(0, 0, 0, 0)
    notification.TextColor3 = color or Color3.new(1, 1, 1)
    notification.BackgroundTransparency = 1
    -- notification.TextColor3 = Color3.new(1, 1, 1)
    notification.TextSize = 20
    notification.Text = text
    notification.TextTransparency = 0
    notification.TextWrapped = false
    notification.TextScaled = true
    -- print(notification.TextScaled)
    notification.Parent = notificationFrame
    task.spawn(function() 
        PlaySound("9102731048")
    end)
    -- Optional: Add a fade-out effect before deletion
    task.wait(duration or 5)
    local destroyTween = TweenService:Create(notification, TweenInfoSetting, { TextTransparency = 1 })
    destroyTween:Play() 
    destroyTween.Completed:Wait() 
    notification:Destroy() 
end

TextBox.Focused:Connect(function() 
    if TextBox.Text == sampleText then
        TextBox.Text = sampleTextRaw
    end
end)

TextBox.FocusLost:Connect(function(enterPressed)
    if enterPressed and TextBox.Text ~= "" then
        ProcessCommand(TextBox.Text)
        TextBox.Text = ""
    end
    if TextBox.Text == sampleTextRaw then
        TextBox.Text = sampleText
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
